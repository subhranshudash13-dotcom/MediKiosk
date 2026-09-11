import logging
from typing import Tuple
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHash
from app.core.config import settings

logger = logging.getLogger(__name__)

# Argon2id OWASP-compliant parameters with low-memory overhead
_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=19456,  # 19 MB (OWASP recommended minimum)
    parallelism=1,
    hash_len=32,
    salt_len=16,
)


def _apply_pepper(password: str) -> str:
    """Optionally append server-side secret pepper."""
    if settings.PASSWORD_PEPPER:
        return f"{password}:{settings.PASSWORD_PEPPER}"
    return password


def hash_password(password: str) -> str:
    """Generate Argon2id password hash."""
    peppered = _apply_pepper(password)
    return _hasher.hash(peppered)


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against Argon2id hash with constant-time protection."""
    if not password or not hashed:
        return False
    try:
        peppered = _apply_pepper(password)
        return _hasher.verify(hashed, peppered)
    except (VerifyMismatchError, VerificationError, InvalidHash):
        return False
    except Exception as e:
        logger.warning(f"Unexpected error during password verification: {e}")
        return False


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password requirements:
    - Minimum 8 characters
    - Maximum 128 characters
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if len(password) > 128:
        return False, "Password must not exceed 128 characters."
    return True, ""
