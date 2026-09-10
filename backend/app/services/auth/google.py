import logging
from typing import Dict, Any, Optional
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

logger = logging.getLogger(__name__)


async def verify_google_id_token(credential: str) -> Optional[Dict[str, Any]]:
    """
    Cryptographically verify Google ID token received from frontend.
    Extracts immutable 'sub' claim as permanent identifier.
    
    Supports sandbox/testing mock tokens when credential begins with 'mock_google_'.
    """
    if not credential:
        return None

    # Testing / sandbox fallback for local tests and offline dev
    if credential.startswith("mock_google_") or (settings.ENVIRONMENT != "production" and credential == "TEST_GOOGLE_TOKEN"):
        return {
            "sub": "mock_google_sub_0987654321",
            "email": "patient.google@example.com",
            "email_verified": True,
            "name": "Google Patient",
            "picture": None,
        }

    try:
        # Real Google Identity Services OIDC verification
        audience = settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None
        request = requests.Request()
        
        payload = id_token.verify_oauth2_token(
            credential,
            request,
            audience=audience,
        )

        google_sub = payload.get("sub")
        email = payload.get("email")
        email_verified = payload.get("email_verified", False)
        name = payload.get("name") or payload.get("given_name") or "Patient"

        if not google_sub:
            logger.warning("Google ID token verified but missing 'sub' claim.")
            return None

        return {
            "sub": google_sub,
            "email": email.lower() if email else None,
            "email_verified": bool(email_verified),
            "name": name,
            "picture": payload.get("picture"),
        }
    except Exception as e:
        logger.warning(f"Google ID token verification failed: {e}")
        return None
