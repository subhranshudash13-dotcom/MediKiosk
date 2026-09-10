import logging
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.auth import UserContext
from app.services.auth.tokens import decode_access_token
from app.core.database import get_database

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> UserContext:
    """
    FastAPI dependency validating Bearer JWT access token and user status.
    Raises 401 Unauthorized if token is missing, invalid, expired, or revoked.
    """
    token: Optional[str] = None

    if credentials and credentials.credentials:
        token = credentials.credentials
    else:
        # Fallback to cookie
        token = request.cookies.get("mk_access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = await decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
        )

    db = get_database()
    user = await db["users"].find_one({"_id": user_id})
    if not user or user.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or not found.",
        )

    return UserContext(
        user_id=user_id,
        role=user.get("role", "patient"),
        sid=payload.get("sid", ""),
        amr=payload.get("amr", ["password"]),
    )


async def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[UserContext]:
    """
    Optional authentication dependency for kiosk and public-compatible endpoints.
    Returns UserContext if valid token is presented, otherwise None (guest session).
    """
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        return None


async def require_patient(
    current_user: UserContext = Depends(get_current_user),
) -> UserContext:
    """Ensure caller has patient role."""
    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to patient accounts.",
        )
    return current_user


async def require_abha_linked(
    current_user: UserContext = Depends(get_current_user),
) -> UserContext:
    """Ensure patient has a verified, active ABHA identity link."""
    db = get_database()
    abha_link = await db["abha_links"].find_one({
        "user_id": current_user.user_id,
        "verification_status": "verified",
        "unlinked_at": None,
    })

    if not abha_link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ABHA healthcare identity linking required for this health record action.",
        )
    return current_user
