"""
Citizen Fraud Shield API Routes
-------------------------------
Exposes endpoints for fraud risk assessment, report generation,
and session statistics.

Upgrade #2: All endpoints are async def. AI calls use asyncio.to_thread().
Upgrade #3: All response_json columns use json.loads()/json.dumps().
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import sqlite3
import json
import datetime
import logging

from core.citizen_shield_engine import assess_fraud_risk, is_ai_available

logger = logging.getLogger("CITIZEN_SHIELD_API")

router = APIRouter(prefix="/api/v1/citizen-shield", tags=["Citizen Fraud Shield"])

DB_FILE = "drishti_memory.db"


class AssessRequest(BaseModel):
    message: str
    context_type: str = "call"  # call | sms | upi | email


class ReportRequest(BaseModel):
    assessment_id: int


# ──────────────────────────────────────────────
# ── POST /assess — Main fraud risk assessment
# ──────────────────────────────────────────────

@router.post("/assess")
async def assess(req: AssessRequest):
    """
    Async endpoint that runs fraud analysis without blocking the event loop.
    Falls back to rules engine if Gemini API key is not configured.
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Validate context type
    valid_types = {"call", "sms", "upi", "email"}
    context = req.context_type if req.context_type in valid_types else "call"

    try:
        # This is async-safe — AI calls use asyncio.to_thread() internally
        result = await assess_fraud_risk(req.message, context)
    except Exception as e:
        logger.error(f"Assessment failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis engine error: {str(e)}")

    # Persist the assessment to database
    try:
        conn = sqlite3.connect(DB_FILE, timeout=10)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO citizen_assessments (context_type, user_message, verdict, risk_score, risk_level, response_json)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            context,
            req.message,
            result.get("verdict", "UNKNOWN"),
            result.get("risk_score", 0),
            result.get("risk_level", "Unknown"),
            json.dumps(result),
        ))
        conn.commit()
        assessment_id = cursor.lastrowid
        conn.close()
        result["assessment_id"] = assessment_id
    except Exception as e:
        logger.warning(f"Failed to persist assessment: {e}")
        result["assessment_id"] = None

    return result


# ──────────────────────────────────────────────
# ── GET /recent — Recent assessments
# ──────────────────────────────────────────────

@router.get("/recent")
async def get_recent(limit: int = 20):
    """Returns recent assessments with parsed JSON responses."""
    conn = sqlite3.connect(DB_FILE, timeout=10)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM citizen_assessments ORDER BY created_at DESC LIMIT ?",
        (min(limit, 50),),
    )
    rows = []
    for row in cursor.fetchall():
        d = dict(row)
        # Upgrade #3: Parse response_json TEXT → dict
        if d.get("response_json"):
            try:
                d["response"] = json.loads(d["response_json"])
            except (json.JSONDecodeError, TypeError):
                d["response"] = {}
            del d["response_json"]
        rows.append(d)

    conn.close()
    return rows


# ──────────────────────────────────────────────
# ── POST /report — Generate NCRB complaint
# ──────────────────────────────────────────────

@router.post("/report")
async def generate_report(req: ReportRequest):
    """Generate a pre-filled NCRB complaint template from an assessment."""
    conn = sqlite3.connect(DB_FILE, timeout=10)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM citizen_assessments WHERE id = ?", (req.assessment_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Assessment not found")

    assessment = dict(row)
    response_data = {}
    if assessment.get("response_json"):
        try:
            response_data = json.loads(assessment["response_json"])
        except (json.JSONDecodeError, TypeError):
            pass

    report = {
        "report_type": "NCRB_CYBER_CRIME_COMPLAINT",
        "generated_by": "DRISHTI AI — Citizen Fraud Shield",
        "generated_at": datetime.datetime.now().isoformat(),
        "reference_number": f"DRISHTI/CFS-{req.assessment_id:05d}/{datetime.datetime.now().strftime('%Y')}",
        "complaint_category": _map_fraud_to_ncrb(response_data.get("fraud_type", "none")),
        "sub_category": response_data.get("fraud_type", "Unknown").replace("_", " ").title(),
        "incident_summary": {
            "context_type": assessment["context_type"],
            "suspicious_content": assessment["user_message"],
            "ai_verdict": assessment["verdict"],
            "risk_score": assessment["risk_score"],
            "threat_indicators": response_data.get("threat_indicators", []),
        },
        "recommended_filing_portal": "https://cybercrime.gov.in",
        "helpline_number": "1930",
        "filing_instructions": [
            "Visit https://cybercrime.gov.in and click 'Report Cyber Crime'",
            "Select the appropriate category from the dropdown",
            "Fill in the incident details — use the summary above as reference",
            "Upload any screenshots of the suspicious call/message",
            "Note down the complaint reference number for tracking",
        ],
        "legal_note": (
            "This report is auto-generated by DRISHTI AI to assist citizens in filing "
            "cybercrime complaints. It does not constitute a formal FIR. Please submit "
            "this at your nearest Police Station or on the NCRB portal for formal registration."
        ),
    }

    return report


def _map_fraud_to_ncrb(fraud_type: str) -> str:
    """Map internal fraud types to NCRB complaint categories."""
    mapping = {
        "digital_arrest": "Online Financial Fraud — Impersonation of Government Official",
        "phishing": "Online Financial Fraud — Phishing",
        "upi_fraud": "Online Financial Fraud — UPI/Internet Banking Related",
        "sim_swap": "Online Financial Fraud — SIM Swap / SIM Cloning",
        "impersonation": "Online Financial Fraud — Identity Theft / Impersonation",
        "lottery_scam": "Online Financial Fraud — Lottery / Prize / Ponzi Scheme",
        "none": "Other Cyber Crime",
    }
    return mapping.get(fraud_type, "Other Cyber Crime")


# ──────────────────────────────────────────────
# ── GET /stats — Shield statistics
# ──────────────────────────────────────────────

@router.get("/stats")
async def get_stats():
    conn = sqlite3.connect(DB_FILE, timeout=10)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM citizen_assessments")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM citizen_assessments WHERE verdict = 'DANGEROUS'")
    dangerous = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM citizen_assessments WHERE verdict = 'SUSPICIOUS'")
    suspicious = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM citizen_assessments WHERE verdict = 'SAFE'")
    safe = cursor.fetchone()[0]

    conn.close()

    return {
        "total_assessments": total,
        "dangerous_count": dangerous,
        "suspicious_count": suspicious,
        "safe_count": safe,
        "threats_blocked": dangerous + suspicious,
        "engine_mode": "ai" if is_ai_available() else "rules",
    }


@router.get("/health")
async def health():
    return {
        "status": "online",
        "engine": "citizen_fraud_shield",
        "ai_available": is_ai_available(),
        "version": "1.0.0",
    }
