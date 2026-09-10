import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Response, Request, status

from app.core.config import settings
from app.core.database import get_database
from app.models.auth import (
    SignupRequest,
    LoginRequest,
    GoogleAuthRequest,
    OtpRequest,
    OtpRequestResponse,
    OtpVerifyRequest,
    RefreshTokenRequest,
    TokenResponse,
    PatientAuthResponse,
    UserProfileResponse,
    ProfileUpdateRequest,
    LinkPhoneRequest,
    LinkGoogleRequest,
    SetPasswordRequest,
    UserContext,
)
from app.services.auth.passwords import (
    hash_password,
    verify_password,
    validate_password_strength,
)
from app.services.auth.tokens import (
    create_access_token,
    create_refresh_session,
    rotate_refresh_token,
    revoke_session,
    revoke_all_user_sessions,
)
from app.services.auth.otp import (
    request_otp_challenge,
    verify_otp_challenge,
    normalize_phone,
)
from app.services.auth.google import verify_google_id_token
from app.services.auth.audit import record_audit_event
from app.services.auth.identity import (
    normalize_email,
    find_identity,
    create_patient_account,
    link_identity_to_user,
    unlink_identity_from_user,
    get_patient_profile_data,
)
from app.services.auth.dependencies import get_current_user
from app.models.user import get_current_utc_iso

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Patient Authentication"])


def _set_auth_cookies(response: Response, refresh_token: str, access_token: Optional[str] = None):
    """Set secure HttpOnly cookies for session management."""
    max_age_refresh = settings.REFRESH_TOKEN_TTL_DAYS * 86400
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=refresh_token,
        max_age=max_age_refresh,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        domain=settings.AUTH_COOKIE_DOMAIN,
    )
    if access_token:
        response.set_cookie(
            key="mk_access_token",
            value=access_token,
            max_age=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
            httponly=True,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
            domain=settings.AUTH_COOKIE_DOMAIN,
        )


def _clear_auth_cookies(response: Response):
    """Clear session cookies."""
    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        domain=settings.AUTH_COOKIE_DOMAIN,
    )
    response.delete_cookie(
        key="mk_access_token",
        domain=settings.AUTH_COOKIE_DOMAIN,
    )


@router.post("/signup", response_model=PatientAuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, response: Response, request: Request):
    """
    Register a new patient with Email + Password.
    Hashes password using Argon2id and creates immutable user identity.
    """
    valid, msg = validate_password_strength(payload.password)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    email = normalize_email(payload.email)
    existing = await find_identity("password", email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    pwd_hash = hash_password(payload.password)
    norm_phone = normalize_phone(payload.mobile) if payload.mobile else None

    user_id, profile_id = await create_patient_account(
        provider="password",
        provider_subject=email,
        full_name=payload.full_name,
        preferred_language=payload.preferred_language,
        normalized_email=email,
        password_hash=pwd_hash,
        mobile=norm_phone,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        verified=False,
    )

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    refresh_token, session_id = await create_refresh_session(
        user_id=user_id,
        device_type="web",
        user_agent=user_agent,
        ip_address=client_ip,
    )

    access_token = create_access_token(
        user_id=user_id,
        session_id=session_id,
        role="patient",
        amr=["password"],
    )

    _set_auth_cookies(response, refresh_token, access_token)
    user_data = await get_patient_profile_data(user_id)

    return PatientAuthResponse(
        user=user_data,
        next_step="OPTIONAL_ABHA_LINK",
        tokens=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
            refresh_token=refresh_token,
        ),
    )


@router.post("/login", response_model=PatientAuthResponse)
async def login(payload: LoginRequest, response: Response, request: Request):
    """
    Authenticate patient via Email + Password.
    """
    email = normalize_email(payload.email)
    identity = await find_identity("password", email)

    if not identity or not identity.get("password_hash"):
        await record_audit_event(
            event_type="LOGIN_FAILED",
            metadata={"email": email, "reason": "user_not_found"},
            result="failure",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(payload.password, identity["password_hash"]):
        await record_audit_event(
            event_type="LOGIN_FAILED",
            user_id=identity["user_id"],
            metadata={"email": email, "reason": "invalid_password"},
            result="failure",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user_id = identity["user_id"]
    db = get_database()
    now_iso = get_current_utc_iso()
    await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"last_login_at": now_iso}},
    )

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    refresh_token, session_id = await create_refresh_session(
        user_id=user_id,
        device_type="web",
        user_agent=user_agent,
        ip_address=client_ip,
    )

    access_token = create_access_token(
        user_id=user_id,
        session_id=session_id,
        role="patient",
        amr=["password"],
    )

    _set_auth_cookies(response, refresh_token, access_token)
    user_data = await get_patient_profile_data(user_id)

    await record_audit_event(
        event_type="LOGIN_SUCCESS",
        user_id=user_id,
        metadata={"provider": "password"},
    )

    return PatientAuthResponse(
        user=user_data,
        next_step="DASHBOARD",
        tokens=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
            refresh_token=refresh_token,
        ),
    )


@router.post("/otp/request", response_model=OtpRequestResponse)
async def request_otp(payload: OtpRequest):
    """
    Initiate Mobile OTP challenge for login or registration.
    Rate-limited and secured with HMAC in Redis.
    """
    try:
        challenge_id, demo_otp = await request_otp_challenge(
            phone=payload.phone,
            purpose=payload.purpose,
        )
        return OtpRequestResponse(
            challenge_id=challenge_id,
            expires_in=settings.OTP_TTL_SECONDS,
            resend_after=30,
            demo_otp=demo_otp,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))


@router.post("/otp/verify", response_model=PatientAuthResponse)
async def verify_otp(payload: OtpVerifyRequest, response: Response, request: Request):
    """
    Verify Mobile OTP challenge.
    Creates new account if phone is first-time visitor, or loads existing patient.
    """
    is_valid, phone, purpose = await verify_otp_challenge(
        challenge_id=payload.challenge_id,
        submitted_otp=payload.otp,
    )

    if not is_valid or not phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code.",
        )

    db = get_database()
    identity = await find_identity("phone", phone)
    is_new_user = False

    if identity:
        user_id = identity["user_id"]
        now_iso = get_current_utc_iso()
        await db["users"].update_one(
            {"_id": user_id},
            {"$set": {"last_login_at": now_iso}},
        )
    else:
        # Create new patient account
        is_new_user = True
        default_name = payload.full_name or f"Patient {phone[-4:]}"
        user_id, _ = await create_patient_account(
            provider="phone",
            provider_subject=phone,
            full_name=default_name,
            preferred_language=payload.preferred_language or "hi",
            mobile=phone,
            date_of_birth=payload.date_of_birth,
            gender=payload.gender,
            verified=True,
        )

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    refresh_token, session_id = await create_refresh_session(
        user_id=user_id,
        device_type="web",
        user_agent=user_agent,
        ip_address=client_ip,
    )

    access_token = create_access_token(
        user_id=user_id,
        session_id=session_id,
        role="patient",
        amr=["otp"],
    )

    _set_auth_cookies(response, refresh_token, access_token)
    user_data = await get_patient_profile_data(user_id)

    await record_audit_event(
        event_type="LOGIN_SUCCESS" if not is_new_user else "SIGNUP_COMPLETED",
        user_id=user_id,
        metadata={"provider": "phone", "phone": phone[:6] + "****"},
    )

    return PatientAuthResponse(
        user=user_data,
        next_step="OPTIONAL_ABHA_LINK" if is_new_user else "DASHBOARD",
        tokens=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
            refresh_token=refresh_token,
        ),
    )


@router.post("/google", response_model=PatientAuthResponse)
async def google_auth(payload: GoogleAuthRequest, response: Response, request: Request):
    """
    Sign in or register using Google Identity Services (OpenID Connect).
    Backend cryptographically validates ID token and links Google sub claim.
    """
    claims = await verify_google_id_token(payload.credential)
    if not claims:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not verify Google authentication credential.",
        )

    google_sub = claims["sub"]
    email = claims.get("email")
    name = claims.get("name") or "Patient"

    identity = await find_identity("google", google_sub)
    is_new = False

    if identity:
        user_id = identity["user_id"]
    elif email and (pwd_ident := await find_identity("password", email)):
        # Verified email matches existing password user -> link Google
        user_id = pwd_ident["user_id"]
        await link_identity_to_user(
            user_id=user_id,
            provider="google",
            provider_subject=google_sub,
            normalized_email=email,
            verified=True,
        )
    else:
        # Create brand new patient
        is_new = True
        user_id, _ = await create_patient_account(
            provider="google",
            provider_subject=google_sub,
            full_name=name,
            preferred_language=payload.preferred_language,
            normalized_email=email,
            verified=True,
        )

    db = get_database()
    now_iso = get_current_utc_iso()
    await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"last_login_at": now_iso}},
    )

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    refresh_token, session_id = await create_refresh_session(
        user_id=user_id,
        device_type="web",
        user_agent=user_agent,
        ip_address=client_ip,
    )

    access_token = create_access_token(
        user_id=user_id,
        session_id=session_id,
        role="patient",
        amr=["google"],
    )

    _set_auth_cookies(response, refresh_token, access_token)
    user_data = await get_patient_profile_data(user_id)

    await record_audit_event(
        event_type="LOGIN_SUCCESS" if not is_new else "SIGNUP_COMPLETED",
        user_id=user_id,
        metadata={"provider": "google"},
    )

    return PatientAuthResponse(
        user=user_data,
        next_step="OPTIONAL_ABHA_LINK" if is_new else "DASHBOARD",
        tokens=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
            refresh_token=refresh_token,
        ),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    payload: Optional[RefreshTokenRequest] = None,
    request: Request = None,
    response: Response = None,
):
    """
    Rotate refresh token and issue new access token.
    Enforces refresh token family tracking and reuse detection.
    """
    token_str = (payload.refresh_token if payload and payload.refresh_token else None)
    if not token_str and request:
        token_str = request.cookies.get(settings.AUTH_COOKIE_NAME)

    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token.",
        )

    client_ip = request.client.host if request and request.client else None
    user_agent = request.headers.get("user-agent") if request else None

    try:
        new_access, new_refresh, user_id, role = await rotate_refresh_token(
            old_raw_token=token_str,
            device_type="web",
            user_agent=user_agent,
            ip_address=client_ip,
        )
        if response:
            _set_auth_cookies(response, new_refresh, new_access)

        return TokenResponse(
            access_token=new_access,
            expires_in=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
            refresh_token=new_refresh,
        )
    except ValueError as e:
        if response:
            _clear_auth_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout")
async def logout(
    response: Response,
    current_user: UserContext = Depends(get_current_user),
):
    """
    Revoke current refresh session and clear browser auth cookies.
    """
    await revoke_session(current_user.sid, reason="logout")
    _clear_auth_cookies(response)
    await record_audit_event(
        event_type="LOGOUT",
        user_id=current_user.user_id,
    )
    return {"success": True, "message": "Logged out successfully."}


@router.post("/logout-all")
async def logout_all(
    response: Response,
    current_user: UserContext = Depends(get_current_user),
):
    """
    Revoke all active sessions across all devices for the current patient.
    """
    await revoke_all_user_sessions(current_user.user_id, reason="logout_all")
    _clear_auth_cookies(response)
    await record_audit_event(
        event_type="LOGOUT_ALL",
        user_id=current_user.user_id,
    )
    return {"success": True, "message": "All active sessions have been revoked."}


@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: UserContext = Depends(get_current_user)):
    """
    Return currently authenticated patient profile, active identities, and ABHA status.
    """
    try:
        profile_data = await get_patient_profile_data(current_user.user_id)
        return UserProfileResponse(**profile_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    payload: ProfileUpdateRequest,
    current_user: UserContext = Depends(get_current_user),
):
    """
    Update patient profile demographic details.
    """
    db = get_database()
    now_iso = get_current_utc_iso()
    updates = {"updated_at": now_iso}

    if payload.full_name is not None:
        updates["full_name"] = payload.full_name
    if payload.date_of_birth is not None:
        updates["date_of_birth"] = payload.date_of_birth
    if payload.gender is not None:
        updates["gender"] = payload.gender
    if payload.preferred_language is not None:
        updates["preferred_language"] = payload.preferred_language
    if payload.mobile is not None:
        updates["mobile"] = normalize_phone(payload.mobile)
    if payload.email is not None:
        updates["email"] = normalize_email(payload.email)

    await db["patient_profiles"].update_one(
        {"user_id": current_user.user_id},
        {"$set": updates},
    )

    profile_data = await get_patient_profile_data(current_user.user_id)
    return UserProfileResponse(**profile_data)


# Identity Linking Endpoints

@router.post("/identities/phone/link")
async def link_phone(
    payload: LinkPhoneRequest,
    current_user: UserContext = Depends(get_current_user),
):
    """Link a verified phone number to the current account."""
    is_valid, phone, _ = await verify_otp_challenge(payload.challenge_id, payload.otp)
    if not is_valid or not phone:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")

    try:
        identity_id = await link_identity_to_user(
            user_id=current_user.user_id,
            provider="phone",
            provider_subject=phone,
            verified=True,
        )
        # Also update profile mobile if empty
        db = get_database()
        await db["patient_profiles"].update_one(
            {"user_id": current_user.user_id, "mobile": None},
            {"$set": {"mobile": phone}},
        )
        return {"success": True, "identity_id": identity_id, "phone": phone}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/identities/google/link")
async def link_google(
    payload: LinkGoogleRequest,
    current_user: UserContext = Depends(get_current_user),
):
    """Link a verified Google account to the current account."""
    claims = await verify_google_id_token(payload.credential)
    if not claims:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Google token.")

    try:
        identity_id = await link_identity_to_user(
            user_id=current_user.user_id,
            provider="google",
            provider_subject=claims["sub"],
            normalized_email=claims.get("email"),
            verified=True,
        )
        return {"success": True, "identity_id": identity_id, "email": claims.get("email")}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/identities/password/set")
async def set_password(
    payload: SetPasswordRequest,
    current_user: UserContext = Depends(get_current_user),
):
    """Set or update password on current account."""
    valid, msg = validate_password_strength(payload.password)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    db = get_database()
    profile = await db["patient_profiles"].find_one({"user_id": current_user.user_id}) or {}
    email = profile.get("email")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please set an email address on your profile before configuring a password.",
        )

    pwd_hash = hash_password(payload.password)
    now_iso = get_current_utc_iso()

    # Check if password identity exists
    existing = await find_identity("password", email)
    if existing:
        if existing["user_id"] != current_user.user_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email in use by another account.")
        await db["auth_identities"].update_one(
            {"_id": existing["_id"]},
            {"$set": {"password_hash": pwd_hash}},
        )
    else:
        await link_identity_to_user(
            user_id=current_user.user_id,
            provider="password",
            provider_subject=email,
            normalized_email=email,
            password_hash=pwd_hash,
            verified=False,
        )

    return {"success": True, "message": "Password configured successfully."}


@router.delete("/identities/{provider}")
async def unlink_identity(
    provider: str,
    current_user: UserContext = Depends(get_current_user),
):
    """Unlink an authentication provider (preventing account lockout)."""
    try:
        await unlink_identity_from_user(current_user.user_id, provider)
        return {"success": True, "message": f"{provider} unlinked successfully."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
