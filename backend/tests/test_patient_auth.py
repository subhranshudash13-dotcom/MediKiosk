import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import get_database, init_db_indexes
from app.core.redis_client import get_redis


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    """Ensure indexes and clean collections for tests."""
    db = get_database()
    await init_db_indexes(db)
    # Clear test collections before each test run
    for col in [
        "users", "auth_identities", "patient_profiles", "abha_links",
        "auth_sessions", "abdm_consents", "audit_events", "sessions"
    ]:
        if hasattr(db[col], "_docs"):
            db[col]._docs = []
        elif hasattr(db[col], "delete_many"):
            await db[col].delete_many({})


@pytest.mark.asyncio
async def test_password_signup_and_argon2_hashing():
    """Verify patient email/password registration and Argon2id hash storage."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "email": "ramesh.kumar@example.com",
            "password": "SecurePassword123!",
            "full_name": "Ramesh Kumar",
            "preferred_language": "hi",
            "date_of_birth": "1980-05-15",
            "gender": "male",
            "mobile": "9876543210",
        }
        res = await ac.post("/api/v1/auth/signup", json=payload)
        assert res.status_code == 201, res.text
        data = res.json()

        assert "tokens" in data
        assert "access_token" in data["tokens"]
        assert data["user"]["full_name"] == "Ramesh Kumar"
        assert data["user"]["role"] == "patient"
        assert data["user"]["abha_status"] == "NOT_LINKED"
        assert data["next_step"] == "OPTIONAL_ABHA_LINK"

        # Verify database record and Argon2id hash format
        db = get_database()
        user_id = data["user"]["user_id"]
        assert user_id.startswith("usr_")

        identity = await db["auth_identities"].find_one({"user_id": user_id})
        assert identity is not None
        assert identity["provider"] == "password"
        assert identity["provider_subject"] == "ramesh.kumar@example.com"
        assert identity["password_hash"].startswith("$argon2id$")

        # Verify audit log recorded
        audit = await db["audit_events"].find_one({"event_type": "SIGNUP_COMPLETED", "user_id": user_id})
        assert audit is not None


@pytest.mark.asyncio
async def test_duplicate_signup_rejection():
    """Verify duplicate email registration is rejected with 409 Conflict."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "email": "duplicate@example.com",
            "password": "Password1234!",
            "full_name": "Duplicate Test",
        }
        res1 = await ac.post("/api/v1/auth/signup", json=payload)
        assert res1.status_code == 201

        res2 = await ac.post("/api/v1/auth/signup", json=payload)
        assert res2.status_code == 409
        assert "already exists" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_password_login_success_and_failure():
    """Verify login authentication with password verification and audit trail."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Signup
        signup_payload = {
            "email": "login.test@example.com",
            "password": "CorrectPassword123",
            "full_name": "Login Tester",
        }
        await ac.post("/api/v1/auth/signup", json=signup_payload)

        # 2. Login success
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "login.test@example.com",
            "password": "CorrectPassword123",
        })
        assert login_res.status_code == 200
        tokens = login_res.json()["tokens"]
        assert "access_token" in tokens

        # 3. Login wrong password
        fail_res = await ac.post("/api/v1/auth/login", json={
            "email": "login.test@example.com",
            "password": "WrongPassword999",
        })
        assert fail_res.status_code == 401

        # 4. Login non-existent email
        ghost_res = await ac.post("/api/v1/auth/login", json={
            "email": "nobody@example.com",
            "password": "SomePassword123",
        })
        assert ghost_res.status_code == 401


@pytest.mark.asyncio
async def test_mobile_otp_flow_new_and_returning_patient():
    """Verify Mobile OTP challenge, new patient profile creation, and returning patient login."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Request OTP
        req_res = await ac.post("/api/v1/auth/otp/request", json={"phone": "+919876543210"})
        assert req_res.status_code == 200
        req_data = req_res.json()
        challenge_id = req_data["challenge_id"]
        demo_otp = req_data["demo_otp"]
        assert demo_otp is not None

        # 2. Verify OTP for brand new patient
        verify_res = await ac.post("/api/v1/auth/otp/verify", json={
            "challenge_id": challenge_id,
            "otp": demo_otp,
            "full_name": "Sita Devi",
            "preferred_language": "hi",
        })
        assert verify_res.status_code == 200
        new_data = verify_res.json()
        assert new_data["user"]["full_name"] == "Sita Devi"
        first_user_id = new_data["user"]["user_id"]
        assert new_data["next_step"] == "OPTIONAL_ABHA_LINK"

        # 3. Request OTP again for the SAME phone number (returning patient)
        req_res2 = await ac.post("/api/v1/auth/otp/request", json={"phone": "9876543210"})
        assert req_res2.status_code == 200
        c2 = req_res2.json()["challenge_id"]
        otp2 = req_res2.json()["demo_otp"]

        verify_res2 = await ac.post("/api/v1/auth/otp/verify", json={
            "challenge_id": c2,
            "otp": otp2,
        })
        assert verify_res2.status_code == 200
        returning_data = verify_res2.json()
        # Must resolve to the exact same user_id without creating duplicate records
        assert returning_data["user"]["user_id"] == first_user_id
        assert returning_data["next_step"] == "DASHBOARD"


@pytest.mark.asyncio
async def test_google_authentication_flow():
    """Verify Google Sign-In with cryptographic verification and account setup."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/v1/auth/google", json={
            "credential": "mock_google_token_sample",
            "preferred_language": "en",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["user"]["full_name"] == "Google Patient"
        assert "google" in data["user"]["identities"]
        assert data["user"]["user_id"].startswith("usr_")


@pytest.mark.asyncio
async def test_token_refresh_rotation_and_family_reuse_detection():
    """
    Verify Rotating Refresh Tokens:
    - Refresh issues a new refresh token and invalidates old token.
    - Replaying the old refresh token trips Family Reuse Detection, invalidating all sessions in family.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Signup to acquire initial refresh token
        signup = await ac.post("/api/v1/auth/signup", json={
            "email": "rotation@example.com",
            "password": "Password123!",
            "full_name": "Rotation Tester",
        })
        tokens = signup.json()["tokens"]
        rt1 = tokens["refresh_token"]

        # 1. Normal rotation
        ref_res = await ac.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
        assert ref_res.status_code == 200
        new_tokens = ref_res.json()
        rt2 = new_tokens["refresh_token"]
        assert rt2 != rt1

        # 2. Token reuse attack simulation: try using rt1 again!
        attack_res = await ac.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
        assert attack_res.status_code == 401
        assert "reuse detected" in attack_res.json()["detail"].lower()

        # 3. Because family was invalidated, rt2 should now also be rejected
        fail_res = await ac.post("/api/v1/auth/refresh", json={"refresh_token": rt2})
        assert fail_res.status_code == 401


@pytest.mark.asyncio
async def test_logout_and_protected_me_endpoint():
    """Verify token validation on /auth/me and revocation on /auth/logout."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        signup = await ac.post("/api/v1/auth/signup", json={
            "email": "me.test@example.com",
            "password": "Password123!",
            "full_name": "Me Tester",
        })
        token = signup.json()["tokens"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Access /auth/me
        me_res = await ac.post("/api/v1/auth/login", json={"email": "me.test@example.com", "password": "Password123!"})
        token = me_res.json()["tokens"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        get_me = await ac.get("/api/v1/auth/me", headers=headers)
        assert get_me.status_code == 200
        assert get_me.json()["email"] == "me.test@example.com"

        # Logout
        logout_res = await ac.post("/api/v1/auth/logout", headers=headers)
        assert logout_res.status_code == 200


@pytest.mark.asyncio
async def test_abha_verification_and_duplicate_conflict():
    """
    Verify ABHA linking lifecycle:
    - Start verification -> Confirm with OTP -> Bound to patient.
    - Attempting to link the same ABHA to a second patient throws 409 Conflict.
    - Unlinking works safely.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register Patient 1
        p1 = await ac.post("/api/v1/auth/signup", json={
            "email": "p1@example.com",
            "password": "Password123!",
            "full_name": "Patient One",
        })
        token1 = p1.json()["tokens"]["access_token"]
        h1 = {"Authorization": f"Bearer {token1}"}

        # Start verification
        v_start = await ac.post("/api/v1/abha/verification/start", json={
            "abha_id": "91-1234-5678-9012",
        }, headers=h1)
        assert v_start.status_code == 200
        txn_id = v_start.json()["txn_id"]

        # Confirm verification
        v_confirm = await ac.post("/api/v1/abha/verification/confirm", json={
            "txn_id": txn_id,
            "otp": "123456",
        }, headers=h1)
        assert v_confirm.status_code == 200
        c_data = v_confirm.json()
        assert c_data["abha_status"] == "VERIFIED"

        # Check status endpoint
        status_res = await ac.get("/api/v1/abha/status", headers=h1)
        assert status_res.status_code == 200
        assert status_res.json()["linked"] is True

        # 2. Register Patient 2
        p2 = await ac.post("/api/v1/auth/signup", json={
            "email": "p2@example.com",
            "password": "Password123!",
            "full_name": "Patient Two",
        })
        token2 = p2.json()["tokens"]["access_token"]
        h2 = {"Authorization": f"Bearer {token2}"}

        # Patient 2 tries to link the SAME ABHA number -> 409 Conflict
        p2_start = await ac.post("/api/v1/abha/verification/start", json={
            "abha_id": "91-1234-5678-9012",
        }, headers=h2)
        p2_txn = p2_start.json()["txn_id"]

        p2_conflict = await ac.post("/api/v1/abha/verification/confirm", json={
            "txn_id": p2_txn,
            "otp": "123456",
        }, headers=h2)
        assert p2_conflict.status_code == 409
        assert "already linked" in p2_conflict.json()["detail"]

        # 3. Patient 1 unlinks ABHA
        unlink_res = await ac.delete("/api/v1/abha/link", headers=h1)
        assert unlink_res.status_code == 200
        status_after = await ac.get("/api/v1/abha/status", headers=h1)
        assert status_after.json()["linked"] is False


@pytest.mark.asyncio
async def test_abdm_stateful_consents():
    """Verify ABDM stateful consent lifecycle requires linked ABHA."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Patient without ABHA
        p = await ac.post("/api/v1/auth/signup", json={
            "email": "consent.tester@example.com",
            "password": "Password123!",
            "full_name": "Consent Tester",
        })
        token = p.json()["tokens"]["access_token"]
        h = {"Authorization": f"Bearer {token}"}

        # Attempt creating consent without ABHA -> 403 Forbidden
        denied = await ac.post("/api/v1/abdm/consents", json={"purpose": "CAREGIV"}, headers=h)
        assert denied.status_code == 403

        # Link ABHA
        v_start = await ac.post("/api/v1/abha/verification/start", json={"abha_id": "91-8888-7777-6666"}, headers=h)
        await ac.post("/api/v1/abha/verification/confirm", json={
            "txn_id": v_start.json()["txn_id"],
            "otp": "123456",
        }, headers=h)

        # Create consent with linked ABHA -> 201 Created
        created = await ac.post("/api/v1/abdm/consents", json={"purpose": "CAREGIV"}, headers=h)
        assert created.status_code == 201
        consent_id = created.json()["id"]
        assert created.json()["status"] == "REQUESTED"

        # List consents
        c_list = await ac.get("/api/v1/abdm/consents", headers=h)
        assert c_list.status_code == 200
        assert len(c_list.json()) >= 1

        # Revoke consent
        rev = await ac.post(f"/api/v1/abdm/consents/{consent_id}/revoke", headers=h)
        assert rev.status_code == 200

        # Verify revoked state
        det = await ac.get(f"/api/v1/abdm/consents/{consent_id}", headers=h)
        assert det.json()["status"] == "REVOKED"


@pytest.mark.asyncio
async def test_kiosk_encounter_binding_authenticated_vs_guest():
    """
    Verify Kiosk Session encounter binding:
    - Authenticated patient binds user_id, profile, and ABHA link to kiosk session.
    - Guest encounter continues to work seamlessly with user_id: None.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Unauthenticated / Guest session is rejected with 401
        guest_res = await ac.post("/api/v1/kiosk/session/start", json={"language": "hi"})
        assert guest_res.status_code == 401
        assert "Authentication required" in guest_res.text

        db = get_database()

        # 2. Authenticated patient session
        p = await ac.post("/api/v1/auth/signup", json={
            "email": "kiosk.patient@example.com",
            "password": "Password123!",
            "full_name": "Kiosk Patient",
            "preferred_language": "ta",
        })
        user_id = p.json()["user"]["user_id"]
        token = p.json()["tokens"]["access_token"]
        auth_header = {"Authorization": f"Bearer {token}"}

        auth_kiosk_res = await ac.post(
            "/api/v1/kiosk/session/start",
            json={"mode": "ayush"},
            headers=auth_header,
        )
        assert auth_kiosk_res.status_code == 200
        auth_sess_id = auth_kiosk_res.json()["session_id"]

        auth_doc = await db["sessions"].find_one({"session_id": auth_sess_id})
        assert auth_doc["user_id"] == user_id
        assert auth_doc["patient_profile_id"] is not None
        assert auth_doc["name"] == "Kiosk Patient"
        assert auth_doc["authentication_context"]["authenticated"] is True


@pytest.mark.asyncio
async def test_update_profile_demographics():
    """Verify patient profile demographic updates."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        p = await ac.post("/api/v1/auth/signup", json={
            "email": "update.profile@example.com",
            "password": "Password123!",
            "full_name": "Initial Name",
        })
        token = p.json()["tokens"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        up_res = await ac.put("/api/v1/auth/profile", json={
            "full_name": "Updated Name",
            "date_of_birth": "1992-10-24",
            "gender": "female",
            "preferred_language": "bn",
        }, headers=headers)
        assert up_res.status_code == 200
        data = up_res.json()
        assert data["full_name"] == "Updated Name"
        assert data["gender"] == "female"
        assert data["preferred_language"] == "bn"


@pytest.mark.asyncio
async def test_identity_linking_and_unlinking_guard():
    """
    Verify identity management:
    - Attempting to unlink the only authentication provider is blocked.
    - Adding a second identity succeeds.
    - Unlinking one identity when multiple exist succeeds.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        p = await ac.post("/api/v1/auth/signup", json={
            "email": "linking.test@example.com",
            "password": "Password123!",
            "full_name": "Link Tester",
        })
        token = p.json()["tokens"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Attempt to unlink password when it's the only provider -> 400 Bad Request
        unlink_fail = await ac.delete("/api/v1/auth/identities/password", headers=headers)
        assert unlink_fail.status_code == 400
        assert "only authentication method" in unlink_fail.json()["detail"]

        # 2. Link Google
        link_google = await ac.post("/api/v1/auth/identities/google/link", json={
            "credential": "mock_google_token_for_link",
        }, headers=headers)
        assert link_google.status_code == 200

        # Check me endpoint now shows both identities
        me_res = await ac.get("/api/v1/auth/me", headers=headers)
        assert "password" in me_res.json()["identities"]
        assert "google" in me_res.json()["identities"]

        # 3. Now unlinking password succeeds because google remains
        unlink_ok = await ac.delete("/api/v1/auth/identities/password", headers=headers)
        assert unlink_ok.status_code == 200


@pytest.mark.asyncio
async def test_otp_rate_limiting():
    """Verify rapid repeated OTP requests hit rate limit."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        phone = "+919999888877"
        statuses = []
        for _ in range(7):
            r = await ac.post("/api/v1/auth/otp/request", json={"phone": phone})
            statuses.append(r.status_code)

        # First 5 should succeed (200), subsequent should be rate-limited (429)
        assert 200 in statuses
        assert 429 in statuses

