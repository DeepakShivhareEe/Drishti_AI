from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DRISHTI_HUB")

app = FastAPI(title="DRISHTI Command Center Hub")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. INITIALIZE SQLITE DATABASE ---
DB_FILE = "drishti_memory.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ficn_scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            serial_number TEXT,
            verdict TEXT,
            device_id TEXT,
            location TEXT,
            timestamp DATETIME
        )
    """)
    conn.commit()
    conn.close()

init_db()
# -------------------------------------

@app.post("/api/v1/alerts/trigger", status_code=201)
async def receive_ficn_alert(request: Request):
    """
    Receives the AI payload from Port 8001 (Docker).
    Checks the database for duplicate serial numbers to detect Organized Rings.
    """
    data = await request.json()
    
    # Extract data from the incoming Docker payload
    serial = data.get("payload", {}).get("detected_serial", "UNKNOWN")
    verdict = data.get("payload", {}).get("status_verdict", "")
    
    # Mock data for hackathon (In reality, the React frontend would send this)
    current_device = "OFFICER_TERMINAL_04"
    current_location = "DELHI_CHECKPOINT_A"
    current_time = datetime.datetime.now()

    # 🔥 FIX 1: Case-insensitive check to ensure we always catch the LLM's exact wording
    if serial != "UNKNOWN" and "counterfeit" in verdict.lower():
        
        # 🔥 FIX 2: Added timeout=10 to prevent SQLite "database is locked" crashes
        conn = sqlite3.connect(DB_FILE, timeout=10)
        cursor = conn.cursor()
        
        # Check if this exact fake serial exists in our DB
        cursor.execute("SELECT device_id, timestamp, location FROM ficn_scans WHERE serial_number = ? ORDER BY timestamp DESC LIMIT 1", (serial,))
        previous_scan = cursor.fetchone()
        
        if previous_scan:
            prev_device, prev_time_str, prev_location = previous_scan
            prev_time = datetime.datetime.fromisoformat(prev_time_str)
            
            time_diff_minutes = (current_time - prev_time).total_seconds() / 60.0
            
            # --- THE SMART MEMORY LOGIC GATE ---
            if prev_device == current_device and time_diff_minutes < 15:
                logger.info(f"Duplicate scan by same officer ignored. Serial: {serial}")
                data["network_alert"] = "SAFE_RESCAN"
            else:
                logger.critical(f"🚨 COUNTERFEIT RING DETECTED! Serial {serial} was previously scanned at {prev_location}.")
                data["network_alert"] = f"CRITICAL: MULTIPLE CIRCULATION DETECTED. Previously seen at {prev_location}."
                data["threat_level"] = "NATIONAL_CRITICAL"
        else:
            # First time seeing this fake note. Save it to memory.
            cursor.execute("""
                INSERT INTO ficn_scans (serial_number, verdict, device_id, location, timestamp)
                VALUES (?, ?, ?, ?, ?)
            """, (serial, verdict, current_device, current_location, current_time.isoformat()))
            conn.commit()
            logger.info(f"New counterfeit serial {serial} added to national database.")
            data["network_alert"] = "NEW_THREAT_LOGGED"
            
        conn.close()

    return {"status": "success", "processed_payload": data}

if __name__ == "__main__":
    import uvicorn
    # Hub runs on 8000, AI runs on 8001
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)