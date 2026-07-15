"""
DRISHTI Backend Server
~~~~~~~~~~~~~~~~~~~~~~
Digital Risk Intelligence & Safety Hub for Threat Interception

Run with:
    python main.py

Or via uvicorn directly:
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import ALLOWED_ORIGINS, HOST, PORT
from api.routes.scam_detector import router as scam_router
from api.routes.reports import router as reports_router
from api.routes.currency import router as currency_router
from api.routes.phishing_scanner import router as phishing_router
from core.database import init_db


app = FastAPI(
    title="DRISHTI API",
    description="AI-powered proactive defense platform — scam detection, currency verification, fraud network analysis",
    version="1.0.0",
)

# Initialize SQLite database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount module routers
app.include_router(scam_router)
app.include_router(reports_router)
app.include_router(currency_router)
app.include_router(phishing_router)


@app.get("/")
async def root():
    return {
        "name": "DRISHTI",
        "tagline": "See the threat before it strikes",
        "version": "1.0.0",
        "modules": {
            "scam_detector": "/api/scam",
            # future modules:
            # "fraud_graph": "/api/graph",
        }
    }


@app.get("/health")
async def health():
    return {"status": "operational", "service": "drishti-backend"}


if __name__ == "__main__":
    import uvicorn
    print("\n[DRISHTI] Backend starting...")
    print(f"  Server: http://{HOST}:{PORT}")
    print(f"  Docs:   http://{HOST}:{PORT}/docs\n")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
