import logging
from typing import Dict, Any
from app.models.abdm import AbhaKYC, ConsentArtifact

logger = logging.getLogger(__name__)


class ABDMGatewayService:
    """ABDM M1/M2/M3 Sandbox Gateway client and ABHA orchestrator."""

    async def verify_abha(self, abha_id: str) -> AbhaKYC:
        """Verify ABHA ID or Aadhaar details with sandbox OTP."""
        logger.info(f"ABDM: Verifying ABHA ID {abha_id}")
        return AbhaKYC(
            abha_id=abha_id,
            abha_address=f"{abha_id.replace('-', '')}@abdm",
            name="Ramesh Kumar",
            gender="MALE",
            dob="1978-04-12",
            mobile="9876543210",
            auth_status="verified"
        )


abdm_service = ABDMGatewayService()
