import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.models.abdm import AbhaKYC, ConsentArtifact, CareContext

logger = logging.getLogger(__name__)


class ABDMGatewayService:
    """ABDM M1/M2/M3 Sandbox Gateway client and ABHA orchestrator."""

    async def generate_otp(self, identifier: str) -> Dict[str, Any]:
        """Simulate sending OTP for ABHA/Mobile/Aadhaar verification."""
        txn_id = str(uuid.uuid4())
        logger.info(f"ABDM: Generated OTP for identifier {identifier}, txn_id: {txn_id}")
        return {
            "txn_id": txn_id,
            "message": "OTP sent successfully to registered mobile number (Simulated default: 123456)",
            "simulated_otp": "123456"
        }

    async def verify_otp(self, txn_id: str, otp: str, identifier: str) -> AbhaKYC:
        """Verify OTP with ABDM Sandbox M1 flow."""
        logger.info(f"ABDM: Verifying OTP {otp} for txn_id: {txn_id}")
        # Realistic sample demo profile
        return AbhaKYC(
            abha_id="91-4567-8901-2345",
            abha_address="ramesh.kumar@abdm",
            name="Ramesh Kumar",
            gender="MALE",
            dob="1978-04-12",
            mobile=identifier if len(identifier) == 10 else "9876543210",
            auth_status="verified"
        )

    async def verify_abha(self, abha_id: str) -> AbhaKYC:
        """Verify ABHA ID or Aadhaar details."""
        logger.info(f"ABDM: Direct verify for ABHA ID {abha_id}")
        return AbhaKYC(
            abha_id=abha_id or "91-4567-8901-2345",
            abha_address=f"{abha_id.replace('-', '').lower()}@abdm" if "@" not in abha_id else abha_id,
            name="Ramesh Kumar",
            gender="MALE",
            dob="1978-04-12",
            mobile="9876543210",
            auth_status="verified"
        )

    async def scan_qr_code(self, qr_payload: str) -> AbhaKYC:
        """Simulate Scan & Share (Counter QR) ABDM M1 flow."""
        logger.info(f"ABDM: Processing QR Code scan token")
        return AbhaKYC(
            abha_id="91-8832-1920-4491",
            abha_address="priya.sharma@abdm",
            name="Priya Sharma",
            gender="FEMALE",
            dob="1992-08-24",
            mobile="9811223344",
            auth_status="verified"
        )

    async def create_consent_request(self, abha_id: str, hi_types: List[str], purpose: str) -> ConsentArtifact:
        """Create M3 Consent Request to fetch historic health records."""
        now = datetime.utcnow()
        consent = ConsentArtifact(
            consent_id=f"CONSENT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=abha_id,
            purpose=purpose or "CAREGIV",
            hi_types=hi_types or ["Prescription", "DiagnosticReport", "OPConsultation"],
            granted_at=now,
            expires_at=now + timedelta(days=1),
            is_revoked=False
        )
        logger.info(f"ABDM: Created Consent Artifact {consent.consent_id} for {abha_id}")
        return consent

    async def get_linked_records(self, abha_id: str) -> List[Dict[str, Any]]:
        """Simulate FHIR health records discovered via ABDM HIU gateway."""
        return [
            {
                "hip_id": "IN0810000001",
                "hip_name": "AIIMS New Delhi - Department of General Medicine",
                "care_context": "OPD-2024-88491",
                "record_type": "OPConsultation",
                "date": "2024-11-15",
                "summary": "Follow-up consultation for Type 2 Diabetes Mellitus & Mild Hypertension.",
                "doctor": "Dr. S. K. Mukherjee, MD"
            },
            {
                "hip_id": "IN0810000042",
                "hip_name": "Max Super Speciality Hospital, Saket",
                "care_context": "LAB-2024-0912",
                "record_type": "DiagnosticReport",
                "date": "2024-09-12",
                "summary": "HbA1c: 7.2% (Elevated), Fasting Glucose: 138 mg/dL, Lipid Profile: Normal.",
                "doctor": "Dr. Ananya Roy, Pathologist"
            },
            {
                "hip_id": "IN0810000001",
                "hip_name": "AIIMS New Delhi - Cardiology OPD",
                "care_context": "RX-2023-4412",
                "record_type": "Prescription",
                "date": "2023-05-10",
                "summary": "Tab Metformin 500mg BD, Tab Telmisartan 40mg OD.",
                "doctor": "Dr. V. Ramanathan, DM Cardiology"
            }
        ]


abdm_service = ABDMGatewayService()
