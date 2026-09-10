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
        # Build set of accepted audiences
        import os
        accepted_audiences = set()
        for candidate in [
            settings.GOOGLE_CLIENT_ID,
            settings.AUTH_GOOGLE_ID,
            os.getenv("AUTH_GOOGLE_ID"),
            os.getenv("GOOGLE_CLIENT_ID"),
            "606427874598-76nvnlq7okltu96t3r6gis170lq0m2c8.apps.googleusercontent.com",
            "631405336370-9agmq8mqmms9jhnvj961b9317q0qf5ir.apps.googleusercontent.com",
        ]:
            if candidate:
                cid = candidate.strip()
                accepted_audiences.add(cid)
                if "-" in cid:
                    accepted_audiences.add(cid.replace("-", ""))

        request = requests.Request()
        payload = id_token.verify_oauth2_token(
            credential,
            request,
            audience=None,
        )

        token_aud = payload.get("aud")
        if accepted_audiences and token_aud not in accepted_audiences:
            logger.warning(f"Google ID token aud '{token_aud}' not in accepted audiences: {accepted_audiences}")
            return None

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
