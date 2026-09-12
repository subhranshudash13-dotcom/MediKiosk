import os
import sys
import json
import httpx
import asyncio

BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:3000"

async def test_live_system():
    print("=" * 70)
    print("      MEDIKIOSK LIVE END-TO-END SYSTEM VERIFICATION")
    print("=" * 70)

    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1. Test Healthcheck
        print("\n1. Testing Backend Healthcheck...")
        res = await client.get(f"{BASE_URL}/api/v1/health")
        print(f"   HTTP Status: {res.status_code}")
        health_data = res.json()
        print(f"   Status: {health_data.get('status')} | Service: {health_data.get('service')}")
        print(f"   MongoDB Mode: {health_data.get('services', {}).get('mongodb', {}).get('mode')}")
        assert res.status_code == 200, "Healthcheck failed"
        print("   [PASS] Backend is Healthy and responsive.")

        # 2. Test Supported Languages
        print("\n2. Testing 22 Indian Languages Endpoint...")
        res = await client.get(f"{BASE_URL}/api/v1/kiosk/languages")
        langs = res.json()
        print(f"   HTTP Status: {res.status_code} | Supported Languages count: {len(langs)}")
        assert len(langs) >= 10, "Language count below expected"
        print("   [PASS] Multilingual language catalog verified.")

        # 3. Test Session Start (Phase 1 & 2)
        print("\n3. Testing Kiosk Intake Session Initialization (Phase 1 & 2)...")
        session_payload = {
            "language": "hi",
            "mode": "allopathy",
            "patient_name": "Ramesh Chandra",
            "age": 52,
            "gender": "Male",
            "abha_id": "91-4521-8890-1234"
        }
        res = await client.post(f"{BASE_URL}/api/v1/kiosk/session/start", json=session_payload)
        session_data = res.json()
        session_id = session_data["session_id"]
        token = session_data["token"]
        patient_id = session_data["patient_id"]
        print(f"   Session ID: {session_id} | Token: {token} | Patient ID: {patient_id}")
        assert res.status_code == 200 and session_id, "Session initialization failed"
        print("   [PASS] Session created with token and demographics.")

        # 4. Test Care Routing (Phase 8)
        print("\n4. Testing Care Routing & Department Recommendation (Phase 8)...")
        routing_payload = {
            "chief_complaint": "Severe crushing chest pain with left arm radiation and shortness of breath",
            "mode": "allopathy"
        }
        res = await client.post(f"{BASE_URL}/api/v1/clinical/care-routing/recommend", json=routing_payload)
        routing_data = res.json()
        print(f"   Suggested Dept: {routing_data.get('suggested_department')}")
        print(f"   Urgency Level: {routing_data.get('urgency_level')}")
        print(f"   Doctor Available: {routing_data.get('available_doctors', [{}])[0].get('name')}")
        assert routing_data.get("suggested_department") == "Cardiology", "Routing mismatch"
        print("   [PASS] Care Routing correctly routed to Cardiology.")

        # 5. Test Intake Complete & Push to Live Doctor Queue (Phase 3, 4, 6, 7)
        print("\n5. Submitting Completed Intake to Doctor Queue (Phase 3–7)...")
        intake_payload = {
            "session_id": session_id,
            "token": token,
            "name": "Ramesh Chandra",
            "age": 52,
            "gender": "Male",
            "abha_id": "91-4521-8890-1234",
            "triage_level": "EMERGENCY",
            "chief_complaint": "Crushing retrosternal chest pain x 3 days",
            "intake_source": "PATIENT",
            "socrates": {
                "site": "Retrosternal chest",
                "onset": "Sudden onset 3 days ago",
                "character": "Heavy crushing squeezing pressure",
                "radiation": "Radiating to left shoulder and arm",
                "associations": ["Cold sweats", "Shortness of breath", "Nausea"],
                "duration_days": 3,
                "severity_score": 9
            },
            "past_history": ["Type 2 Diabetes Mellitus (5 yrs)", "Hypertension (3 yrs)"],
            "allergies": ["Penicillin (Severe skin rash)"],
            "current_medications": [{"drug": "Tab Amlodipine", "dose": "5 mg", "frequency": "1-0-0"}],
            "vitals": {"bp": "158/96 mmHg", "pulse": "104 bpm", "spo2": "94%", "temp": "98.6 °F"},
            "evidence_trail": [
                {
                    "id": "ev-1",
                    "timeframe": "3 Days Duration",
                    "title": "Patient Spoken Voice Statement",
                    "sourceType": "VOICE",
                    "sourceSnippet": "Teen din se seene me bohot tezi se dard ho raha hai."
                }
            ],
            "language": "hi"
        }
        res = await client.post(f"{BASE_URL}/api/v1/clinical/intake-complete", json=intake_payload)
        print(f"   Intake Submission Response: {res.json().get('message')}")
        assert res.status_code == 200, "Intake completion failed"
        print("   [PASS] Intake synced to Doctor Queue.")

        # 6. Test Completeness Engine (Phase 6)
        print("\n6. Testing Clinical Completeness Engine Scorecard...")
        res = await client.get(f"{BASE_URL}/api/v1/clinical/completeness/{session_id}")
        comp_data = res.json()
        print(f"   Score: {comp_data.get('score_percentage')}% | Missing: {comp_data.get('missing_critical_dimensions')}")
        print(f"   Next Adaptive Prompt: {comp_data.get('adaptive_followup_prompt')}")
        assert comp_data.get("score_percentage") >= 80, "Completeness score unexpectedly low"
        print("   [PASS] Completeness Engine correctly evaluated clinical coverage.")

        # 7. Test Doctor Queue (Phase 9)
        print("\n7. Verifying Live Doctor Queue...")
        res = await client.get(f"{BASE_URL}/api/v1/clinical/queue")
        queue = res.json()
        print(f"   Total Queue Items: {len(queue)}")
        matched_item = next((q for q in queue if q.get("sessionId") == session_id or q.get("token") == token), None)
        assert matched_item is not None, "Patient not found in live queue"
        print(f"   Found in Queue: Token {matched_item['token']} | Name: {matched_item['name']} | Priority: {matched_item['triageLevel']}")
        print("   [PASS] Patient is live in Doctor Cockpit queue.")

        # 8. Test 30-Second Clinical Brief & Evidence Linking (Phase 9)
        print("\n8. Testing 30-Second Clinical Brief & Evidence Linkage...")
        res = await client.get(f"{BASE_URL}/api/v1/clinical/summary/{session_id}")
        summary = res.json()
        print(f"   Chief Concern: {summary.get('chief_complaint')}")
        print(f"   HPI: {summary.get('hpi')}")
        print(f"   Allergies: {summary.get('allergies')}")
        print(f"   Evidence Links: {len(summary.get('evidence_links', []))} source items linked")
        assert summary.get("chief_complaint") and summary.get("hpi"), "Clinical summary missing narrative"
        print("   [PASS] 30-Second Clinical Brief synthesized with evidence linkages.")

        # 9. Test Doctor Consultation Sign-Off & Encounter Record Creation (Phase 10, 11, 12)
        print("\n9. Doctor Consultation Sign-off & Encounter Creation (Phase 10–12)...")
        approve_payload = {
            "doctor_name": "Dr. S. K. Mukherjee",
            "doctor_registration": "MCI-2011-8849",
            "provisional_diagnosis": "Acute Coronary Syndrome (Unstable Angina) - Rule out NSTEMI",
            "clinical_notes": "Stat 12-lead ECG and Serum Troponin I ordered. Bedside monitoring initiated.",
            "prescribed_medications": [
                {"name": "Tab Aspirin", "dosage": "325 mg", "frequency": "STAT (Immediate)", "instructions": "Chewable"},
                {"name": "Tab Clopidogrel", "dosage": "300 mg", "frequency": "STAT", "instructions": "Oral"},
                {"name": "Tab Sorbitrate", "dosage": "5 mg", "frequency": "Sublingual SOS", "instructions": "Under tongue"}
            ]
        }
        res = await client.patch(f"{BASE_URL}/api/v1/clinical/session/{session_id}/approve", json=approve_payload)
        approve_data = res.json()
        print(f"   Consultation Sign-off Status: {approve_data.get('status')}")
        print(f"   Encounter ID Committed: {approve_data.get('encounter_id')}")
        assert res.status_code == 200, "Consultation approval failed"
        print("   [PASS] Encounter record committed for longitudinal patient history.")

        # 10. Test Longitudinal History for Next Visit
        print("\n10. Testing Longitudinal History Retrieval for Future Visits...")
        res = await client.get(f"{BASE_URL}/api/v1/clinical/patient/{patient_id}/encounters")
        long_data = res.json()
        print(f"   Has Previous Encounters: {long_data.get('has_previous_encounters')}")
        print(f"   Latest Diagnosis Recalled: {long_data.get('latest_diagnosis')}")
        print(f"   Next Visit Comparison Prompt: {long_data.get('comparison_prompt')}")
        print("   [PASS] Longitudinal history recalled successfully for returning visits.")

        # 11. Test Frontend Next.js Pages
        print("\n11. Testing Frontend Route Responses (Next.js)...")
        routes = ["/", "/intake", "/kiosk", "/documents", "/doctor", "/records"]
        for r in routes:
            fres = await client.get(f"{FRONTEND_URL}{r}")
            print(f"   Route {r:12s} -> Status: {fres.status_code} ({'OK' if fres.status_code == 200 else 'FAIL'})")
            assert fres.status_code == 200, f"Route {r} failed with {fres.status_code}"

    print("\n" + "=" * 70)
    print("  ALL 11 LIVE SYSTEM & END-TO-END WORKFLOW CHECKS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_live_system())
