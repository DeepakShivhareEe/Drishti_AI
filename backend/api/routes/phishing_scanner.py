"""
Phishing Scanner API Routes
---------------------------
Exposes endpoints for analyzing URLs and SMS/Text messages.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from core.phishing_engine import scanner
from core.auth import get_current_user

router = APIRouter(prefix="/api/phishing", tags=["Phishing Scanner"])

class UrlScanRequest(BaseModel):
    url: str

class TextScanRequest(BaseModel):
    text: str

@router.post("/scan-url", dependencies=[Depends(get_current_user)])
async def scan_url(req: UrlScanRequest):
    """Analyze a single URL for phishing indicators."""
    try:
        result = scanner.scan_url(req.url)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"URL scanning failed: {str(e)}")

@router.post("/scan-text", dependencies=[Depends(get_current_user)])
async def scan_text(req: TextScanRequest):
    """Analyze SMS or email text for phishing indicators."""
    try:
        result = scanner.scan_text(req.text)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Text scanning failed: {str(e)}")

@router.get("/health")
async def health_check():
    return {
        "status": "online",
        "engine": "phishing_scanner",
        "version": "1.0.0"
    }
