from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sqlite3
import datetime
import logging
import asyncio
import json
import random

from sse_starlette.sse import EventSourceResponse
from api.routes.phishing_scanner import router as phishing_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DRISHTI_HUB")

# --- Database file path ---
DB_FILE = "drishti_memory.db"

# ─────────────────────────────────────────────────────────
# ── LIVE THREAT SIMULATION ENGINE (Background Spawner) ──
# ─────────────────────────────────────────────────────────

# Pool of Indian cities with real coordinates for random spawning
SPAWN_CITIES = [
    {"city": "Hyderabad, TS",   "lat": 17.3850, "lon": 78.4867},
    {"city": "Pune, MH",        "lat": 18.5204, "lon": 73.8567},
    {"city": "Gurugram, HR",    "lat": 28.4595, "lon": 77.0266},
    {"city": "Chennai, TN",     "lat": 13.0827, "lon": 80.2707},
    {"city": "Ahmedabad, GJ",   "lat": 23.0225, "lon": 72.5714},
    {"city": "Indore, MP",      "lat": 22.7196, "lon": 75.8577},
    {"city": "Kochi, KL",       "lat":  9.9312, "lon": 76.2673},
    {"city": "Visakhapatnam, AP", "lat": 17.6868, "lon": 83.2185},
    {"city": "Nagpur, MH",      "lat": 21.1458, "lon": 79.0882},
    {"city": "Bhopal, MP",      "lat": 23.2599, "lon": 77.4126},
    {"city": "Coimbatore, TN",  "lat": 11.0168, "lon": 76.9558},
    {"city": "Thiruvananthapuram, KL", "lat": 8.5241, "lon": 76.9366},
    {"city": "Guwahati, AS",    "lat": 26.1445, "lon": 91.7362},
    {"city": "Varanasi, UP",    "lat": 25.3176, "lon": 82.9739},
    {"city": "Ranchi, JH",      "lat": 23.3441, "lon": 85.3096},
]

SPAWN_CATEGORIES = [
    "SIM Swap Array",
    "Ransomware Node",
    "Mule Account Cascade",
    "Crypto-Routing Point",
    "Phishing C2 Server",
    "Deep Fake Relay",
    "FICN Distribution Cell",
    "VOIP Spoofing Hub",
    "Dark Web Marketplace",
    "Hawala Micro-Tunnel",
]

SPAWN_DETAILS = [
    "Automated pattern detected by SIGINT module",
    "Cross-referenced with INTERPOL watchlist",
    "Flagged by transaction velocity anomaly engine",
    "AI behavioral model confidence: 94.7%",
    "Linked to 3 prior FIRs across state lines",
    "Device fingerprint matches known threat actor",
    "Geo-fence breach detected near border zone",
    "Voice biometric mismatch triggered alert",
]

THREAT_LEVELS = ["Critical", "High", "Medium"]


async def threat_spawner_loop():
    """Background loop that spawns a random threat node every 15-20 seconds."""
    # Small initial delay to let the server fully boot
    await asyncio.sleep(5)
    logger.info("🔴 SIMULATION ENGINE ONLINE — spawning threats every 15-20s")

    while True:
        delay = random.uniform(15, 20)
        await asyncio.sleep(delay)

        # ── Generate random threat payload ──
        target = random.choice(SPAWN_CITIES)
        # Add slight jitter (±0.03°) so repeat cities don't stack exactly
        lat = round(target["lat"] + random.uniform(-0.03, 0.03), 4)
        lon = round(target["lon"] + random.uniform(-0.03, 0.03), 4)
        category = random.choice(SPAWN_CATEGORIES)
        threat_level = random.choices(THREAT_LEVELS, weights=[30, 45, 25], k=1)[0]
        ip_address = f"{random.randint(10,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
        details = random.choice(SPAWN_DETAILS)

        # ── 1. Persist to SQLite ──
        conn = sqlite3.connect(DB_FILE, timeout=10)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO threat_nodes (category, latitude, longitude, city, threat_level, ip_address, status, details)
            VALUES (?, ?, ?, ?, ?, ?, 'Active', ?)
        """, (category, lat, lon, target["city"], threat_level, ip_address, details))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()

        # ── 2. Broadcast to all SSE listeners ──
        broadcast_payload = {
            "event": "new_threat",
            "id": new_id,
            "category": category,
            "latitude": lat,
            "longitude": lon,
            "city": target["city"],
            "threat_level": threat_level,
            "ip_address": ip_address,
            "status": "Active",
            "details": details,
        }
        for queue in broadcast_queues:
            await queue.put(broadcast_payload)

        logger.info(f"⚡ SPAWNED: [{threat_level}] {category} at {target['city']} (ID {new_id}) → {len(broadcast_queues)} listener(s)")


@asynccontextmanager
async def lifespan(app):
    """Modern FastAPI lifespan: starts the simulation engine on boot."""
    task = asyncio.create_task(threat_spawner_loop())
    logger.info("🚀 DRISHTI Command Center Hub — systems online")
    yield
    task.cancel()
    logger.info("🛑 Simulation engine shut down")


app = FastAPI(title="DRISHTI Command Center Hub", lifespan=lifespan)

# Mount new phishing router
app.include_router(phishing_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. INITIALIZE SQLITE DATABASE ---
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
            # ── Original 4 core nodes ──
            ("Scam Compound", 28.6139, 77.2090, "New Delhi, DL", "Critical", "192.168.1.44", "Active", "Voice match: Fake CBI Script"),
            ("FICN Drop Point", 19.0760, 72.8777, "Mumbai, MH", "High", None, "Active", "Rs 500 counterfeits intercepted"),
            ("Mule Accounts", 12.9716, 77.5946, "Bengaluru, KA", "Medium", "10.4.22.1", "Active", "3 linked bank accounts flagged"),
            ("Cross-border VOIP", 22.5726, 88.3639, "Kolkata, WB", "Critical", "45.22.19.11", "Active", "Spoofed TRAI caller ID traced"),
            # ── Additional demo nodes across India ──
            ("Deep Fake Ops", 26.9124, 75.7873, "Jaipur, RJ", "Critical", "103.14.55.9", "Active", "AI-generated impersonation of IPS officer"),
            ("FICN Print Lab", 13.0827, 80.2707, "Chennai, TN", "High", "172.16.8.22", "Active", "Rs 2000 Super-fake plates recovered"),
            ("Dark Web Laundering", 23.0225, 72.5714, "Ahmedabad, GJ", "Critical", "91.203.44.7", "Active", "Crypto-to-INR mixer linked to 14 accounts"),
            ("SIM Swap Ring", 17.3850, 78.4867, "Hyderabad, TS", "High", "49.37.12.88", "Active", "12 SIM swap fraud cases in 48hrs"),
            ("Hawala Transfer Hub", 26.8467, 80.9462, "Lucknow, UP", "Medium", None, "Active", "Cross-border hawala pipeline identified"),
            ("Phishing Call Center", 21.1702, 72.8311, "Surat, GJ", "High", "157.43.20.6", "Active", "Fake KYC update scripts intercepted"),
            ("Mule Network Relay", 25.5941, 85.1376, "Patna, BR", "Medium", "10.22.9.4", "Active", "Fund relay chain across 8 accounts"),
            ("Counterfeit Passport", 30.7333, 76.7794, "Chandigarh, PB", "Critical", "62.18.77.3", "Active", "Forged passport documents traced to syndicate"),
        ]
        cursor.executemany("""
            INSERT INTO threat_nodes (category, latitude, longitude, city, threat_level, ip_address, status, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_data)
        logger.info("📍 Seeded 12 default threat nodes into the database.")

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
# After updating DB status, it broadcasts a 'node_neutralized' event
# so ALL connected dashboards instantly remove the node from their map.
@app.post("/api/v1/geospatial/dispatch")
async def dispatch_action(request: Request):
    data = await request.json()
    node_id = data.get("node_id")
    
    # 1. Fetch the node's city before updating (for the broadcast payload)
    conn = sqlite3.connect(DB_FILE, timeout=10)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT city, category FROM threat_nodes WHERE id = ?", (node_id,))
    row = cursor.fetchone()
    city = row["city"] if row else "Unknown"
    category = row["category"] if row else "Unknown"
    
    # 2. Update database status
    cursor.execute(
        "UPDATE threat_nodes SET status = 'Neutralized', updated_at = ? WHERE id = ?",
        (datetime.datetime.now().isoformat(), node_id)
    )
    conn.commit()
    conn.close()
    
    # 3. Broadcast 'node_neutralized' event to all SSE listeners
    neutralize_payload = {
        "event": "node_neutralized",
        "node_id": node_id,
        "city": city,
        "category": category,
    }
    for queue in broadcast_queues:
        await queue.put(neutralize_payload)
    
    logger.info(f"✅ NEUTRALIZED: [{category}] at {city} (Node {node_id}) → broadcast to {len(broadcast_queues)} listener(s)")
    return {"status": "neutralized", "node_id": node_id, "city": city}


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
# SSE endpoint that streams 'new_threat' and 'node_neutralized' events.
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