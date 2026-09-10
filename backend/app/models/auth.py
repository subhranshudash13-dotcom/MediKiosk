from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: Optional[str] = None


class UserContext(BaseModel):
    user_id: str
    role: str = "patient"
    sid: str
    amr: List[str] = ["password"]  # "password", "otp", "google"


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2)
    preferred_language: str = "hi"
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    mobile: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str = Field(..., description="Google OIDC ID token string")
    preferred_language: str = "hi"


class OtpRequest(BaseModel):
    phone: str = Field(..., description="Phone number with or without +91")
    purpose: str = "login"  # "login" | "signup" | "link"


class OtpRequestResponse(BaseModel):
    challenge_id: str
    expires_in: int = 300
    resend_after: int = 30
    demo_otp: Optional[str] = None  # Returned during dev / demo mode for seamless kiosk flow


class OtpVerifyRequest(BaseModel):
    challenge_id: str
    otp: str = Field(..., min_length=4, max_length=8)
    full_name: Optional[str] = None
    preferred_language: Optional[str] = "hi"
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    preferred_language: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[EmailStr] = None


class LinkPhoneRequest(BaseModel):
    challenge_id: str
    otp: str


class LinkGoogleRequest(BaseModel):
    credential: str


class SetPasswordRequest(BaseModel):
    password: str = Field(..., min_length=8)


class AbhaVerifyStartRequest(BaseModel):
    abha_id: str = Field(..., description="14-digit ABHA ID or username@abdm")
    auth_mode: str = "mobile_otp"  # "mobile_otp" | "aadhaar_otp"


class AbhaVerifyConfirmRequest(BaseModel):
    txn_id: str
    otp: str


class AbdmConsentCreateRequest(BaseModel):
    hi_types: List[str] = ["Prescription", "DiagnosticReport", "OPConsultation"]
    purpose: str = "CAREGIV"


class AbdmConsentResponse(BaseModel):
    id: str
    user_id: str
    abha_link_id: Optional[str] = None
    abdm_consent_id: str
    purpose: str
    hi_types: List[str]
    status: str
    requested_at: str
    granted_at: Optional[str] = None
    expires_at: Optional[str] = None
    revoked_at: Optional[str] = None


class UserProfileResponse(BaseModel):
    user_id: str
    role: str
    status: str
    full_name: str
    preferred_language: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    identities: List[str] = []
    abha_status: str = "NOT_LINKED"
    abha_address: Optional[str] = None
    abha_number_masked: Optional[str] = None
    created_at: str
    last_login_at: Optional[str] = None


class PatientAuthResponse(BaseModel):
    user: Dict[str, Any]
    next_step: str = "DASHBOARD"  # "DASHBOARD" | "ONBOARDING" | "OPTIONAL_ABHA_LINK"
    tokens: TokenResponse
