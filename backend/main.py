from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import datetime
import logging
import asyncio
import json

from sse_starlette.sse import EventSourceResponse

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
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS threat_nodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            city TEXT NOT NULL,
            threat_level TEXT NOT NULL,
            ip_address TEXT,
            status TEXT DEFAULT 'Active',
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed default threat nodes if table is empty
    cursor.execute("SELECT COUNT(*) FROM threat_nodes")
    if cursor.fetchone()[0] == 0:
        seed_data = [
            ("Scam Compound", 28.6139, 77.2090, "New Delhi, DL", "Critical", "192.168.1.44", "Active", "Voice match: Fake CBI Script"),
            ("FICN Drop Point", 19.0760, 72.8777, "Mumbai, MH", "High", None, "Active", "Rs 500 counterfeits intercepted"),
            ("Mule Accounts", 12.9716, 77.5946, "Bengaluru, KA", "Medium", "10.4.22.1", "Active", "3 linked bank accounts flagged"),
            ("Cross-border VOIP", 22.5726, 88.3639, "Kolkata, WB", "Critical", "45.22.19.11", "Active", "Spoofed TRAI caller ID traced"),
        ]
        cursor.executemany("""
            INSERT INTO threat_nodes (category, latitude, longitude, city, threat_level, ip_address, status, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_data)
        logger.info("📍 Seeded 4 default threat nodes into the database.")

    conn.commit()
    conn.close()

init_db()

# Global queue list for SSE broadcasting
broadcast_queues: list[asyncio.Queue] = []

# -------------------------------------
# ── EXISTING: FICN Alert Endpoint ──
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


# ─────────────────────────────────────────────
# ── GEOSPATIAL INTELLIGENCE ENDPOINTS ──
# ─────────────────────────────────────────────

# ── GET /api/v1/geospatial/nodes ──
# Frontend calls this on page load to get all active threat nodes
@app.get("/api/v1/geospatial/nodes")
def get_threat_nodes():
    conn = sqlite3.connect(DB_FILE, timeout=10)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM threat_nodes WHERE status = 'Active' ORDER BY created_at DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


# ── POST /api/v1/geospatial/dispatch ──
# Called when commander clicks "Dispatch Action Plan".
# After updating DB status, it broadcasts a 'node_dispatched' event
# so ALL connected dashboards instantly remove the node from their map.
@app.post("/api/v1/geospatial/dispatch")
async def dispatch_action(request: Request):
    data = await request.json()
    node_id = data.get("node_id")
    
    # 1. Update database status
    conn = sqlite3.connect(DB_FILE, timeout=10)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE threat_nodes SET status = 'Dispatched', updated_at = ? WHERE id = ?",
        (datetime.datetime.now().isoformat(), node_id)
    )
    conn.commit()
    conn.close()
    
    # 2. Broadcast 'node_dispatched' event to all SSE listeners
    dispatch_payload = {"event": "node_dispatched", "node_id": node_id}
    for queue in broadcast_queues:
        await queue.put(dispatch_payload)
    
    logger.info(f"🚨 DISPATCH: Node {node_id} dispatched → broadcast to {len(broadcast_queues)} listener(s)")
    return {"status": "dispatched", "node_id": node_id}


# ── POST /api/v1/geospatial/nodes ──
# Called by AI modules to register a NEW threat node on the map.
# After saving to DB, it broadcasts the new node to all SSE listeners
# so every connected dashboard sees the threat appear in real-time.
@app.post("/api/v1/geospatial/nodes", status_code=201)
async def create_threat_node(request: Request):
    data = await request.json()
    
    # 1. Save the new threat node to the database
    conn = sqlite3.connect(DB_FILE, timeout=10)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO threat_nodes (category, latitude, longitude, city, threat_level, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, 'Active', ?)
    """, (
        data["category"], data["latitude"], data["longitude"],
        data["city"], data["threat_level"],
        data.get("ip_address"), data.get("details", "")
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    # 2. Build the full payload to broadcast (matches what GET /nodes returns)
    broadcast_payload = {
        "event": "new_threat",
        "id": new_id,
        "category": data["category"],
        "latitude": data["latitude"],
        "longitude": data["longitude"],
        "city": data["city"],
        "threat_level": data["threat_level"],
        "ip_address": data.get("ip_address"),
        "status": "Active",
        "details": data.get("details", ""),
    }
    
    # 3. Push to ALL active SSE subscriber queues
    for queue in broadcast_queues:
        await queue.put(broadcast_payload)
    
    logger.info(f"📍 NEW NODE: {data['category']} at {data['city']} → broadcast to {len(broadcast_queues)} listener(s)")
    return {"status": "created", "id": new_id}


# ── GET /api/v1/geospatial/stream ──
# SSE endpoint that streams both 'new_threat' and 'node_dispatched' events.
@app.get("/api/v1/geospatial/stream")
async def stream_nodes(request: Request):
    """SSE endpoint that streams both 'new_threat' and 'node_dispatched' events."""
    async def generator():
        queue = asyncio.Queue()
        broadcast_queues.append(queue)
        try:
            while True:
                data = await queue.get()
                # Each payload carries its own event type
                event_type = data.pop("event", "new_threat")
                yield {"event": event_type, "data": json.dumps(data)}
        except asyncio.CancelledError:
            broadcast_queues.remove(queue)
    return EventSourceResponse(generator())


if __name__ == "__main__":
    import uvicorn
    # Hub runs on 8000, AI runs on 8001
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)