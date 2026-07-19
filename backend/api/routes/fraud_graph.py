"""
Fraud Graph Intelligence API
-----------------------------
Exposes endpoints for fraud network graph data, AI analysis,
court-admissible evidence export, and live SSE streaming.

Upgrade #3: All metadata_json TEXT columns are parsed to dicts via json.loads()
Upgrade #4: SSE endpoint for live graph node injection
"""

from fastapi import APIRouter, HTTPException, Request
from sse_starlette.sse import EventSourceResponse
import sqlite3
import json
import asyncio
import datetime
import logging

logger = logging.getLogger("FRAUD_GRAPH")

router = APIRouter(prefix="/api/v1/fraud-graph", tags=["Fraud Graph Intelligence"])

DB_FILE = "drishti_memory.db"

# Global queue list for graph SSE broadcasting
broadcast_graph_queues: list[asyncio.Queue] = []


# ──────────────────────────────────────────────
# ── HELPERS: SQLite JSON Serialization Fix (#3)
# ──────────────────────────────────────────────

def _parse_row(row: dict) -> dict:
    """Parse metadata_json TEXT fields into proper dicts."""
    d = dict(row)
    if d.get("metadata_json") is not None:
        try:
            d["metadata"] = json.loads(d["metadata_json"])
        except (json.JSONDecodeError, TypeError):
            d["metadata"] = {}
        del d["metadata_json"]
    return d


def _get_conn():
    conn = sqlite3.connect(DB_FILE, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


# ──────────────────────────────────────────────
# ── GET /networks — All fraud network clusters
# ──────────────────────────────────────────────

@router.get("/networks")
def get_all_networks():
    conn = _get_conn()
    cursor = conn.cursor()

    # Fetch all networks
    cursor.execute("SELECT * FROM fraud_networks ORDER BY risk_score DESC")
    networks = [dict(row) for row in cursor.fetchall()]

    # For each network, attach nodes and edges
    for net in networks:
        cursor.execute("SELECT * FROM fraud_nodes WHERE network_id = ?", (net["id"],))
        net["nodes"] = [_parse_row(row) for row in cursor.fetchall()]

        cursor.execute("SELECT * FROM fraud_edges WHERE network_id = ?", (net["id"],))
        net["edges"] = [_parse_row(row) for row in cursor.fetchall()]

    conn.close()
    return networks


# ──────────────────────────────────────────────
# ── GET /network/{id} — Single network detail
# ──────────────────────────────────────────────

@router.get("/network/{network_id}")
def get_network(network_id: int):
    conn = _get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM fraud_networks WHERE id = ?", (network_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Network not found")

    network = dict(row)

    cursor.execute("SELECT * FROM fraud_nodes WHERE network_id = ?", (network_id,))
    network["nodes"] = [_parse_row(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM fraud_edges WHERE network_id = ?", (network_id,))
    network["edges"] = [_parse_row(row) for row in cursor.fetchall()]

    conn.close()
    return network


# ──────────────────────────────────────────────
# ── POST /analyze — AI pattern analysis
# ──────────────────────────────────────────────

@router.post("/analyze")
async def analyze_network(request: Request):
    data = await request.json()
    network_id = data.get("network_id")

    conn = _get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM fraud_networks WHERE id = ?", (network_id,))
    net_row = cursor.fetchone()
    if not net_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Network not found")

    network = dict(net_row)

    cursor.execute("SELECT * FROM fraud_nodes WHERE network_id = ?", (network_id,))
    nodes = [_parse_row(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM fraud_edges WHERE network_id = ?", (network_id,))
    edges = [_parse_row(row) for row in cursor.fetchall()]
    conn.close()

    # Build analysis report
    node_types = {}
    total_risk = 0
    for n in nodes:
        node_types[n["node_type"]] = node_types.get(n["node_type"], 0) + 1
        total_risk += n.get("risk_score", 0)

    edge_types = {}
    for e in edges:
        edge_types[e["edge_type"]] = edge_types.get(e["edge_type"], 0) + 1

    avg_risk = round(total_risk / len(nodes), 1) if nodes else 0

    # Pattern detection
    patterns = []
    if node_types.get("mule", 0) >= 3:
        patterns.append("Multi-layered mule account cascade detected — indicates organised money laundering")
    if node_types.get("voip", 0) >= 1 and node_types.get("scammer", 0) >= 1:
        patterns.append("VOIP-to-scammer link suggests cross-border spoofed call operation")
    if node_types.get("crypto", 0) >= 1:
        patterns.append("Cryptocurrency exit node detected — funds likely being converted to untraceable assets")
    if edge_types.get("transaction", 0) >= 3:
        patterns.append(f"High transaction density ({edge_types['transaction']} links) — rapid fund movement pattern")
    if node_types.get("victim", 0) >= 2:
        patterns.append(f"Multiple victims ({node_types['victim']}) linked to same infrastructure — coordinated campaign")
    if len(patterns) == 0:
        patterns.append("Standard fraud network topology — no anomalous patterns beyond baseline")

    analysis = {
        "network_id": network_id,
        "network_name": network["name"],
        "overall_risk": network["risk_score"],
        "average_node_risk": avg_risk,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "node_distribution": node_types,
        "edge_distribution": edge_types,
        "detected_patterns": patterns,
        "estimated_total_amount": network.get("total_amount_inr", 0),
        "recommendation": "ESCALATE — Submit to CBI Cyber Crime Division" if network["risk_score"] >= 80 else "MONITOR — Continue surveillance and gather additional evidence",
        "timestamp": datetime.datetime.now().isoformat(),
    }

    return analysis


# ──────────────────────────────────────────────
# ── GET /evidence/{id} — Court-admissible JSON
# ──────────────────────────────────────────────

@router.get("/evidence/{network_id}")
def generate_evidence(network_id: int):
    conn = _get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM fraud_networks WHERE id = ?", (network_id,))
    net_row = cursor.fetchone()
    if not net_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Network not found")

    network = dict(net_row)

    cursor.execute("SELECT * FROM fraud_nodes WHERE network_id = ?", (network_id,))
    nodes = [_parse_row(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM fraud_edges WHERE network_id = ?", (network_id,))
    edges = [_parse_row(row) for row in cursor.fetchall()]
    conn.close()

    evidence_package = {
        "document_type": "DRISHTI_INTELLIGENCE_PACKAGE",
        "version": "1.0",
        "classification": "LAW ENFORCEMENT SENSITIVE",
        "generated_at": datetime.datetime.now().isoformat(),
        "generated_by": "DRISHTI AI — Fraud Graph Intelligence Module",
        "case_reference": f"DRISHTI/FN-{network_id:03d}/{datetime.datetime.now().strftime('%Y')}",
        "network_summary": {
            "name": network["name"],
            "description": network.get("description", ""),
            "risk_assessment": network["risk_score"],
            "status": network["status"],
            "jurisdiction": network.get("jurisdiction", "Pan-India"),
            "estimated_fraud_amount_inr": network.get("total_amount_inr", 0),
        },
        "entities": [
            {
                "entity_id": f"NODE-{n['id']}",
                "type": n["node_type"],
                "label": n["label"],
                "location": {"city": n.get("city", ""), "lat": n.get("latitude"), "lon": n.get("longitude")},
                "risk_score": n.get("risk_score", 0),
                "metadata": n.get("metadata", {}),
            }
            for n in nodes
        ],
        "relationships": [
            {
                "relationship_id": f"EDGE-{e['id']}",
                "type": e["edge_type"],
                "source": f"NODE-{e['source_node_id']}",
                "target": f"NODE-{e['target_node_id']}",
                "weight": e.get("weight", 1.0),
                "metadata": e.get("metadata", {}),
            }
            for e in edges
        ],
        "legal_disclaimer": (
            "This intelligence package has been generated by the DRISHTI AI system for use by "
            "authorised law enforcement officers. The data herein is derived from AI-assisted analysis "
            "of financial transaction metadata, communication records, and device telemetry. "
            "All entities and relationships should be independently verified before use as evidence "
            "in judicial proceedings under the Indian Evidence Act / Bharatiya Sakshya Adhiniyam 2023."
        ),
    }

    return evidence_package


# ──────────────────────────────────────────────
# ── GET /stats — Aggregate statistics
# ──────────────────────────────────────────────

@router.get("/stats")
def get_stats():
    conn = _get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM fraud_networks")
    total_networks = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM fraud_nodes")
    total_nodes = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM fraud_edges")
    total_edges = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(SUM(total_amount_inr), 0) FROM fraud_networks")
    total_amount = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(MAX(risk_score), 0) FROM fraud_networks")
    max_risk = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM fraud_networks WHERE risk_score >= 80")
    critical_networks = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT node_type) FROM fraud_nodes")
    unique_types = cursor.fetchone()[0]

    conn.close()

    return {
        "total_networks": total_networks,
        "total_nodes": total_nodes,
        "total_edges": total_edges,
        "total_fraud_amount_inr": total_amount,
        "max_risk_score": max_risk,
        "critical_networks": critical_networks,
        "unique_entity_types": unique_types,
    }


# ──────────────────────────────────────────────
# ── GET /stream — SSE for live graph updates (#4)
# ──────────────────────────────────────────────

@router.get("/stream")
async def stream_graph(request: Request):
    """SSE endpoint that streams new_fraud_node and network_updated events."""
    async def generator():
        queue = asyncio.Queue()
        broadcast_graph_queues.append(queue)
        try:
            while True:
                data = await queue.get()
                event_type = data.pop("event", "new_fraud_node")
                yield {"event": event_type, "data": json.dumps(data)}
        except asyncio.CancelledError:
            broadcast_graph_queues.remove(queue)

    return EventSourceResponse(generator())


@router.get("/health")
def health():
    return {"status": "online", "engine": "fraud_graph_intelligence", "version": "1.0.0"}
