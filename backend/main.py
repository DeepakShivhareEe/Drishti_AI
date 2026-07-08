from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# This is crucial! It allows your React app (running on a different port) to fetch data safely.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- YOUR FIRST API ENDPOINT ---
@app.get("/api/dashboard/metrics")
def get_dashboard_metrics():
    # Right now, this is static. Later, this will pull from a real database!
    return {
        "scamsPrevented": 142,
        "counterfeitIntercepted": "₹8.4L",
        "highRiskAlerts": 3
    }

@app.get("/")
def read_root():
    return {"status": "DRISHTI Backend is running live!"}