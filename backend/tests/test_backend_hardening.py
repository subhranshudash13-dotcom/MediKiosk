import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import get_database


@pytest.mark.asyncio
async def test_kiosk_session_persistence_and_queue():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Start a session
        start_res = await ac.post("/api/v1/kiosk/session/start", json={
            "patient_name": "Kavita Verma",
            "age": 42,
            "gender": "female",
            "language": "hi",
            "abha_id": "91-4455-8822-1100"
        })
        assert start_res.status_code == 200
        start_data = start_res.json()
        session_id = start_data["session_id"]
        assert "token" in start_data

        # Verify session is persisted in DB immediately
        db = get_database()
        doc = await db.sessions.find_one({"session_id": session_id})
        assert doc is not None
        assert doc["patient_name"] == "Kavita Verma"
        assert doc["status"] == "in_progress"

        # Complete session
        comp_res = await ac.post(f"/api/v1/kiosk/session/{session_id}/complete")
        assert comp_res.status_code == 200

        # Verify status transitioned to ready_for_doctor
        doc_after = await db.sessions.find_one({"session_id": session_id})
        assert doc_after["status"] == "ready_for_doctor"

        # 2. Check Doctor Queue reads live from DB
        q_res = await ac.get("/api/v1/clinical/queue")
        assert q_res.status_code == 200
        queue = q_res.json()
        assert any(item["name"] == "Kavita Verma" for item in queue)

        # 3. Approve Consultation closes loop
        appr_res = await ac.patch(f"/api/v1/clinical/session/{session_id}/approve")
        assert appr_res.status_code == 200
        assert appr_res.json()["queue_status"] == "completed"

        # Verify session status is completed
        doc_final = await db.sessions.find_one({"session_id": session_id})
        assert doc_final["status"] == "completed"


@pytest.mark.asyncio
async def test_dynamic_fhir_patient_extraction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Start a unique patient
        start_res = await ac.post("/api/v1/kiosk/session/start", json={
            "patient_name": "Deepak Joshi",
            "age": 35,
            "gender": "male",
            "language": "en"
        })
        session_id = start_res.json()["session_id"]

        # Fetch dynamic FHIR patient
        fhir_res = await ac.get(f"/api/v1/fhir/Patient/{session_id}")
        assert fhir_res.status_code == 200
        patient_fhir = fhir_res.json()
        assert patient_fhir["resourceType"] == "Patient"
        assert patient_fhir["name"][0]["text"] == "Deepak Joshi"
        assert patient_fhir["gender"] == "male"


@pytest.mark.asyncio
async def test_live_healthcheck_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ["healthy", "degraded"]
        assert "mongodb" in data["services"]
        assert "redis" in data["services"]
        assert "ai_pipeline" in data["services"]
        assert data["services"]["mongodb"]["status"] == "connected"
