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
from fastapi import Depends
import os
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

load_dotenv()

from api.routes.phishing_scanner import router as phishing_router
from api.routes.fraud_graph import router as fraud_graph_router, broadcast_graph_queues
from api.routes.citizen_shield import router as citizen_shield_router
from core.auth import get_current_user, get_current_user_sse, verify_internal_key

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

        # Upgrade #4: Also broadcast to fraud graph SSE listeners
        graph_payload = {
            "event": "new_fraud_node",
            "node_id": new_id,
            "category": category,
            "city": target["city"],
            "threat_level": threat_level,
            "latitude": lat,
            "longitude": lon,
        }
        for gq in broadcast_graph_queues:
            await gq.put(graph_payload)

        logger.info(f"⚡ SPAWNED: [{threat_level}] {category} at {target['city']} (ID {new_id}) → {len(broadcast_queues)} map + {len(broadcast_graph_queues)} graph listener(s)")


@asynccontextmanager
async def lifespan(app):
    """Modern FastAPI lifespan: starts the simulation engine on boot."""
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if cred_path and not firebase_admin._apps:
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info("🔥 Firebase Admin initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin: {e}")
    else:
        logger.warning("FIREBASE_SERVICE_ACCOUNT_JSON not set or already initialized.")
        
    task = asyncio.create_task(threat_spawner_loop())
    logger.info("🚀 DRISHTI Command Center Hub — systems online")
    yield
    task.cancel()
    logger.info("🛑 Simulation engine shut down")


app = FastAPI(title="DRISHTI Command Center Hub", lifespan=lifespan)

# Mount routers
app.include_router(phishing_router)
app.include_router(fraud_graph_router)
app.include_router(citizen_shield_router)

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

    # ── Fraud Graph Intelligence tables ──
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fraud_networks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            risk_score REAL DEFAULT 0.0,
            status TEXT DEFAULT 'Active',
            jurisdiction TEXT,
            total_amount_inr REAL DEFAULT 0.0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fraud_nodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            network_id INTEGER NOT NULL,
            node_type TEXT NOT NULL,
            label TEXT NOT NULL,
            metadata_json TEXT DEFAULT '{}',
            latitude REAL,
            longitude REAL,
            city TEXT,
            risk_score REAL DEFAULT 0.0,
            FOREIGN KEY (network_id) REFERENCES fraud_networks(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fraud_edges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            network_id INTEGER NOT NULL,
            source_node_id INTEGER NOT NULL,
            target_node_id INTEGER NOT NULL,
            edge_type TEXT NOT NULL,
            weight REAL DEFAULT 1.0,
            metadata_json TEXT DEFAULT '{}',
            FOREIGN KEY (network_id) REFERENCES fraud_networks(id),
            FOREIGN KEY (source_node_id) REFERENCES fraud_nodes(id),
            FOREIGN KEY (target_node_id) REFERENCES fraud_nodes(id)
        )
    """)

    # ── Citizen Shield assessment log ──
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS citizen_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            context_type TEXT NOT NULL,
            user_message TEXT NOT NULL,
            verdict TEXT,
            risk_score REAL,
            risk_level TEXT,
            response_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    # ── Seed demo fraud networks ──
    cursor.execute("SELECT COUNT(*) FROM fraud_networks")
    if cursor.fetchone()[0] == 0:
        _seed_fraud_networks(cursor)
        logger.info("🕸️ Seeded 3 demo fraud networks with nodes and edges.")

    conn.commit()
    conn.close()


# Global queue list for SSE broadcasting
broadcast_queues: list[asyncio.Queue] = []

# -------------------------------------
# ── EXISTING: FICN Alert Endpoint ──
# -------------------------------------

@app.post("/api/v1/alerts/trigger", status_code=201, dependencies=[Depends(verify_internal_key)])
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
@app.get("/api/v1/geospatial/nodes", dependencies=[Depends(get_current_user)])
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
@app.post("/api/v1/geospatial/dispatch", dependencies=[Depends(get_current_user)])
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
@app.post("/api/v1/geospatial/nodes", status_code=201, dependencies=[Depends(verify_internal_key)])
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
@app.get("/api/v1/geospatial/stream", dependencies=[Depends(get_current_user_sse)])
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


# ─────────────────────────────────────────────────────────
# ── FRAUD NETWORK SEED DATA
# ─────────────────────────────────────────────────────────

def _seed_fraud_networks(cursor):
    """Seed 3 realistic demo fraud networks with nodes and edges."""
    import json as _json

    # ══════════════════════════════════════════
    # Network 1: Cross-Border Digital Arrest Ring
    # ══════════════════════════════════════════
    cursor.execute("""
        INSERT INTO fraud_networks (name, description, risk_score, status, jurisdiction, total_amount_inr)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "Cross-Border Digital Arrest Ring",
        "Organised syndicate operating from Myanmar/Cambodia compounds, impersonating CBI/ED officers via VOIP calls to trap victims in multi-day digital arrest scenarios. Funds routed through cascaded mule accounts to crypto exchanges.",
        92.5, "Active", "Pan-India (Delhi, Mumbai, Bengaluru)", 1760000
    ))
    net1_id = cursor.lastrowid

    # Nodes for Network 1
    net1_nodes = [
        (net1_id, "scammer", "Scam Compound (Myanmar)", _json.dumps({"country": "Myanmar", "ip": "45.22.19.11", "agents": 15}), 21.9162, 95.9560, "Myawaddy, Myanmar", 95),
        (net1_id, "voip", "VOIP Spoofing Hub", _json.dumps({"provider": "Spoofed TRAI CallerID", "numbers_used": 47, "ip": "103.14.55.9"}), 22.5726, 88.3639, "Kolkata, WB", 88),
        (net1_id, "scammer", "Script Controller", _json.dumps({"role": "Scam script manager", "scripts": ["CBI warrant", "ED investigation", "Customs seizure"]}), 28.6139, 77.2090, "New Delhi, DL", 90),
        (net1_id, "victim", "Victim — Priya S.", _json.dumps({"age": 58, "amount_lost": 420000, "duration_hours": 36, "city": "Mumbai"}), 19.0760, 72.8777, "Mumbai, MH", 10),
        (net1_id, "victim", "Victim — Rajesh K.", _json.dumps({"age": 65, "amount_lost": 680000, "duration_hours": 48, "city": "Bengaluru"}), 12.9716, 77.5946, "Bengaluru, KA", 10),
        (net1_id, "victim", "Victim — Anita M.", _json.dumps({"age": 52, "amount_lost": 310000, "duration_hours": 24, "city": "Pune"}), 18.5204, 73.8567, "Pune, MH", 10),
        (net1_id, "mule", "Mule A (HDFC)", _json.dumps({"bank": "HDFC Bank", "account_type": "Savings", "turnover": 420000}), 19.0760, 72.8777, "Mumbai, MH", 75),
        (net1_id, "mule", "Mule B (ICICI)", _json.dumps({"bank": "ICICI Bank", "account_type": "Current", "turnover": 680000}), 12.9716, 77.5946, "Bengaluru, KA", 72),
        (net1_id, "mule", "Mule C (SBI)", _json.dumps({"bank": "State Bank of India", "account_type": "Savings", "turnover": 350000}), 28.6139, 77.2090, "New Delhi, DL", 70),
        (net1_id, "mule", "Mule D (Axis)", _json.dumps({"bank": "Axis Bank", "account_type": "Savings", "turnover": 310000}), 18.5204, 73.8567, "Pune, MH", 68),
        (net1_id, "crypto", "Crypto Exchange (WazirX)", _json.dumps({"platform": "WazirX", "wallet": "0x7f3a...b2c1", "total_converted": 1450000}), 19.0760, 72.8777, "Mumbai, MH", 85),
        (net1_id, "device", "Device #4A2F", _json.dumps({"type": "Android", "imei": "35678901234", "model": "Redmi Note 12"}), 28.6139, 77.2090, "New Delhi, DL", 45),
    ]
    n1_ids = []
    for node in net1_nodes:
        cursor.execute("""
            INSERT INTO fraud_nodes (network_id, node_type, label, metadata_json, latitude, longitude, city, risk_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, node)
        n1_ids.append(cursor.lastrowid)
    n1_start = n1_ids[0]

    # Edges for Network 1 (node IDs are n1_start + offset)
    net1_edges = [
        (net1_id, n1_start+0, n1_start+1, "call", 5.0, _json.dumps({"calls": 234, "duration_total_min": 1890})),
        (net1_id, n1_start+1, n1_start+2, "call", 4.0, _json.dumps({"calls": 156, "script_relay": True})),
        (net1_id, n1_start+2, n1_start+3, "call", 3.0, _json.dumps({"duration_min": 2160, "impersonation": "CBI Officer"})),
        (net1_id, n1_start+2, n1_start+4, "call", 3.0, _json.dumps({"duration_min": 2880, "impersonation": "ED Officer"})),
        (net1_id, n1_start+2, n1_start+5, "call", 2.5, _json.dumps({"duration_min": 1440, "impersonation": "Customs"})),
        (net1_id, n1_start+3, n1_start+6, "transaction", 4.2, _json.dumps({"amount": 420000, "method": "NEFT", "date": "2024-08-12"})),
        (net1_id, n1_start+4, n1_start+7, "transaction", 6.8, _json.dumps({"amount": 680000, "method": "RTGS", "date": "2024-08-14"})),
        (net1_id, n1_start+5, n1_start+9, "transaction", 3.1, _json.dumps({"amount": 310000, "method": "UPI", "date": "2024-08-15"})),
        (net1_id, n1_start+6, n1_start+8, "fund_relay", 3.5, _json.dumps({"amount": 350000, "hop": 1})),
        (net1_id, n1_start+7, n1_start+8, "fund_relay", 5.0, _json.dumps({"amount": 500000, "hop": 1})),
        (net1_id, n1_start+8, n1_start+10, "transaction", 8.0, _json.dumps({"amount": 1450000, "method": "Crypto Purchase"})),
        (net1_id, n1_start+9, n1_start+10, "fund_relay", 2.5, _json.dumps({"amount": 250000, "hop": 2})),
        (net1_id, n1_start+11, n1_start+2, "device_link", 2.0, _json.dumps({"shared_imei": True})),
        (net1_id, n1_start+11, n1_start+8, "device_link", 1.5, _json.dumps({"shared_imei": True})),
    ]
    cursor.executemany("""
        INSERT INTO fraud_edges (network_id, source_node_id, target_node_id, edge_type, weight, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
    """, net1_edges)

    # ══════════════════════════════════════════
    # Network 2: FICN Distribution Syndicate
    # ══════════════════════════════════════════
    cursor.execute("""
        INSERT INTO fraud_networks (name, description, risk_score, status, jurisdiction, total_amount_inr)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "FICN Distribution Syndicate",
        "Counterfeit currency printing and distribution network operating across Tamil Nadu, Gujarat, and Uttar Pradesh. High-quality Rs 500 FICN notes with near-perfect security features.",
        85.0, "Active", "TN, GJ, UP, MH", 4500000
    ))
    net2_id = cursor.lastrowid

    net2_nodes = [
        (net2_id, "scammer", "FICN Print Lab", _json.dumps({"quality": "Super-fake Rs 500", "monthly_output": 50000, "equipment": "Offset press"}), 13.0827, 80.2707, "Chennai, TN", 95),
        (net2_id, "mule", "Distribution Cell — West", _json.dumps({"region": "Gujarat", "couriers": 5}), 23.0225, 72.5714, "Ahmedabad, GJ", 78),
        (net2_id, "mule", "Distribution Cell — North", _json.dumps({"region": "UP", "couriers": 8}), 26.8467, 80.9462, "Lucknow, UP", 80),
        (net2_id, "mule", "Distribution Cell — Central", _json.dumps({"region": "MP", "couriers": 4}), 23.2599, 77.4126, "Bhopal, MP", 72),
        (net2_id, "bank", "Banking Deposit Point — HDFC", _json.dumps({"branch": "Ahmedabad Main", "deposits": 12}), 23.0225, 72.5714, "Ahmedabad, GJ", 60),
        (net2_id, "bank", "Banking Deposit Point — PNB", _json.dumps({"branch": "Lucknow Civil Lines", "deposits": 18}), 26.8467, 80.9462, "Lucknow, UP", 65),
        (net2_id, "bank", "Banking Deposit Point — BOB", _json.dumps({"branch": "Bhopal MP Nagar", "deposits": 9}), 23.2599, 77.4126, "Bhopal, MP", 55),
        (net2_id, "scammer", "Hawala Tunnel Exit", _json.dumps({"destination": "Nepal/Bangladesh", "weekly_volume": 800000}), 26.4499, 80.3319, "Kanpur, UP", 88),
        (net2_id, "device", "Courier Phone #1", _json.dumps({"type": "Feature phone", "numbers": ["+91-70XXX12345", "+91-70XXX12346"]}), 21.1702, 72.8311, "Surat, GJ", 40),
    ]
    n2_ids = []
    for node in net2_nodes:
        cursor.execute("""
            INSERT INTO fraud_nodes (network_id, node_type, label, metadata_json, latitude, longitude, city, risk_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, node)
        n2_ids.append(cursor.lastrowid)
    n2_start = n2_ids[0]

    net2_edges = [
        (net2_id, n2_start+0, n2_start+1, "account_link", 4.0, _json.dumps({"method": "Courier dispatch", "frequency": "Weekly"})),
        (net2_id, n2_start+0, n2_start+2, "account_link", 5.0, _json.dumps({"method": "Courier dispatch", "frequency": "Bi-weekly"})),
        (net2_id, n2_start+0, n2_start+3, "account_link", 3.0, _json.dumps({"method": "Courier dispatch", "frequency": "Monthly"})),
        (net2_id, n2_start+1, n2_start+4, "transaction", 3.5, _json.dumps({"fake_notes_deposited": 120, "denomination": 500})),
        (net2_id, n2_start+2, n2_start+5, "transaction", 4.5, _json.dumps({"fake_notes_deposited": 180, "denomination": 500})),
        (net2_id, n2_start+3, n2_start+6, "transaction", 2.5, _json.dumps({"fake_notes_deposited": 90, "denomination": 500})),
        (net2_id, n2_start+4, n2_start+7, "fund_relay", 4.0, _json.dumps({"method": "Hawala", "amount": 300000})),
        (net2_id, n2_start+5, n2_start+7, "fund_relay", 5.0, _json.dumps({"method": "Hawala", "amount": 450000})),
        (net2_id, n2_start+6, n2_start+7, "fund_relay", 2.0, _json.dumps({"method": "Hawala", "amount": 180000})),
        (net2_id, n2_start+8, n2_start+1, "device_link", 1.5, _json.dumps({"shared_number": True})),
        (net2_id, n2_start+8, n2_start+2, "device_link", 1.5, _json.dumps({"shared_number": True})),
    ]
    cursor.executemany("""
        INSERT INTO fraud_edges (network_id, source_node_id, target_node_id, edge_type, weight, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
    """, net2_edges)

    # ══════════════════════════════════════════
    # Network 3: SIM Swap + Phishing Campaign
    # ══════════════════════════════════════════
    cursor.execute("""
        INSERT INTO fraud_networks (name, description, risk_score, status, jurisdiction, total_amount_inr)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "SIM Swap + Phishing Campaign",
        "Coordinated phishing call center operation that harvests credentials via fake KYC update calls, then executes SIM swaps to take over bank accounts. Operating across Hyderabad, Surat, and Patna.",
        78.0, "Active", "TS, GJ, BR", 890000
    ))
    net3_id = cursor.lastrowid

    net3_nodes = [
        (net3_id, "scammer", "Phishing Call Center", _json.dumps({"scripts": ["KYC Update", "Account Verification"], "agents": 8, "ip": "157.43.20.6"}), 21.1702, 72.8311, "Surat, GJ", 88),
        (net3_id, "scammer", "SIM Swap Operator A", _json.dumps({"telecom_insider": True, "carrier": "Jio", "swaps_completed": 23}), 17.3850, 78.4867, "Hyderabad, TS", 85),
        (net3_id, "scammer", "SIM Swap Operator B", _json.dumps({"telecom_insider": False, "carrier": "Airtel", "swaps_completed": 17}), 25.5941, 85.1376, "Patna, BR", 82),
        (net3_id, "victim", "Victim — Suresh P.", _json.dumps({"age": 45, "amount_lost": 340000, "bank": "SBI"}), 17.3850, 78.4867, "Hyderabad, TS", 10),
        (net3_id, "victim", "Victim — Meera D.", _json.dumps({"age": 38, "amount_lost": 280000, "bank": "HDFC"}), 25.5941, 85.1376, "Patna, BR", 10),
        (net3_id, "mule", "Fund Relay Account", _json.dumps({"bank": "PayTM Payments Bank", "turnover": 550000}), 28.4595, 77.0266, "Gurugram, HR", 72),
        (net3_id, "mule", "Cash-Out Mule", _json.dumps({"method": "ATM Withdrawal", "daily_limit_used": True, "withdrawals": 34}), 26.9124, 75.7873, "Jaipur, RJ", 70),
        (net3_id, "device", "Shared Burner Phone", _json.dumps({"type": "Samsung J2", "sim_count": 6, "imei": "86754321098"}), 21.1702, 72.8311, "Surat, GJ", 50),
    ]
    n3_ids = []
    for node in net3_nodes:
        cursor.execute("""
            INSERT INTO fraud_nodes (network_id, node_type, label, metadata_json, latitude, longitude, city, risk_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, node)
        n3_ids.append(cursor.lastrowid)
    n3_start = n3_ids[0]

    net3_edges = [
        (net3_id, n3_start+0, n3_start+1, "call", 3.0, _json.dumps({"credentials_shared": 23, "method": "Fake KYC call"})),
        (net3_id, n3_start+0, n3_start+2, "call", 2.5, _json.dumps({"credentials_shared": 17, "method": "Fake KYC call"})),
        (net3_id, n3_start+1, n3_start+3, "account_link", 4.0, _json.dumps({"sim_swapped": True, "bank_otp_intercepted": True})),
        (net3_id, n3_start+2, n3_start+4, "account_link", 3.5, _json.dumps({"sim_swapped": True, "bank_otp_intercepted": True})),
        (net3_id, n3_start+3, n3_start+5, "transaction", 3.4, _json.dumps({"amount": 340000, "method": "NEFT"})),
        (net3_id, n3_start+4, n3_start+5, "transaction", 2.8, _json.dumps({"amount": 280000, "method": "IMPS"})),
        (net3_id, n3_start+5, n3_start+6, "fund_relay", 5.5, _json.dumps({"amount": 550000, "atm_withdrawals": 34})),
        (net3_id, n3_start+7, n3_start+0, "device_link", 2.0, _json.dumps({"shared_device": True})),
        (net3_id, n3_start+7, n3_start+1, "device_link", 1.5, _json.dumps({"shared_sim": True})),
    ]
    cursor.executemany("""
        INSERT INTO fraud_edges (network_id, source_node_id, target_node_id, edge_type, weight, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
    """, net3_edges)

# Initialize database and seed tables
init_db()

if __name__ == "__main__":
    import uvicorn
    # Hub runs on 8000, AI runs on 8001
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)