import os
import firebase_admin
from firebase_admin import auth
from fastapi import Header, Query, HTTPException
import logging

logger = logging.getLogger(__name__)

def get_current_user(authorization: str = Header(None)):
    """Validates the Firebase ID token in the Authorization header."""
    if not firebase_admin._apps:
        # Bypass for local dev when Firebase Admin is not initialized
        return {"uid": "dev-user", "email": "dev@drishti.local"}

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.split("Bearer ")[1]
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verifying token in get_current_user: {e}", exc_info=True)
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

def get_current_user_sse(token: str = Query(None)):
    """Validates the Firebase ID token from the URL query parameter for SSE streams."""
    if not firebase_admin._apps:
        # Bypass for local dev when Firebase Admin is not initialized
        return {"uid": "dev-user", "email": "dev@drishti.local"}

    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verifying token in get_current_user_sse: {e}", exc_info=True)
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

def verify_internal_key(x_internal_api_key: str = Header(None)):
    """Validates the internal shared secret for service-to-service communication."""
    expected_key = os.getenv("INTERNAL_API_KEY")
    if not expected_key:
        raise HTTPException(status_code=500, detail="Server misconfiguration: INTERNAL_API_KEY not set")
    
    if not x_internal_api_key or x_internal_api_key != expected_key:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid internal API key")
    return True
