from typing import List, Union, Optional
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "MediKiosk AI Intake Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Server binding
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    # MongoDB Atlas / Local MongoDB
    MONGODB_URI: str = "mongodb+srv://Shalabh1234:Shalabh@cluster1.agij8pk.mongodb.net/?appName=Cluster1"
    MONGODB_DB_NAME: str = "medikiosk"

    # Redis Cache & Queues
    REDIS_URL: str = "redis://localhost:6379/0"

    # Patient Authentication & Security
    JWT_SECRET: str = "medikiosk-patient-auth-jwt-secret-key-change-in-prod-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_TTL_MINUTES: int = 15
    REFRESH_TOKEN_TTL_DAYS: int = 14
    PASSWORD_PEPPER: str = ""
    
    # Google Sign-In (OpenID Connect / Google Identity Services)
    GOOGLE_CLIENT_ID: str = ""

    # Mobile OTP Settings
    OTP_PROVIDER: str = "mock"  # "mock" | "sms"
    OTP_HMAC_SECRET: str = "medikiosk-otp-secret-salt-2026"
    OTP_TTL_SECONDS: int = 300
    OTP_MAX_ATTEMPTS: int = 5

    # Cookie Security
    AUTH_COOKIE_NAME: str = "mk_refresh_token"
    AUTH_COOKIE_SECURE: bool = False  # Set to True in HTTPS production
    AUTH_COOKIE_SAMESITE: str = "lax"
    AUTH_COOKIE_DOMAIN: Optional[str] = None

    # PII Protection & Lookups
    PII_LOOKUP_HMAC_KEY: str = "medikiosk-pii-lookup-hmac-key-2026"

    # AI Services (AI4Bharat / Bhashini / IndicConformer)
    BHASHINI_API_KEY: str = ""
    BHASHINI_USER_ID: str = ""
    BHASHINI_PIPELINE_ID: str = ""

    # LLM Providers (Provider-Agnostic)
    LLM_PROVIDER: str = "gemini"  # "gemini" | "openai" | "groq" | "local"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # OCR Engine
    OCR_ENGINE: str = "paddleocr"  # "paddleocr" | "tesseract" | "mock"

    # ABDM Gateway / Sandbox
    ABDM_CLIENT_ID: str = ""
    ABDM_CLIENT_SECRET: str = ""
    ABDM_BASE_URL: str = "https://dev.abdm.gov.in/gateway"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
