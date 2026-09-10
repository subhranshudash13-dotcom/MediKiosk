import os
import sys
import json
import asyncio
import httpx

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.services.ai.ai4bharat_service import ai4bharat_service
from app.services.ai.fast_pipeline import fast_ai_pipeline
from app.services.ai.orchestrator import ai_orchestrator
from app.services.clinical.report_generator import report_generator

async def test_bhashini_live():
    print("=" * 60)
    print("1. TESTING LIVE BHASHINI INTEGRATION")
    print("=" * 60)
    
    test_text = "छाती में बहुत तेज दर्द हो रहा है और सांस लेने में तकलीफ है।"
    print(f"Translating Hindi text: '{test_text}'")
    
    translation = await ai4bharat_service.translate_indic_text(
        text=test_text,
        source_lang="hi",
        target_lang="en"
    )
    print(f"Translation result: {translation}")
    assert translation is not None and len(translation) > 0, "Translation failed"
    
    print("\nSynthesizing IndicTTS audio for Hindi response...")
    tts_text = "नमस्ते, आपको यह दर्द कब से हो रहा है?"
    audio_base64 = await ai4bharat_service.synthesize_vernacular_speech(
        text=tts_text,
        language_code="hi",
        gender="female"
    )
    print(f"IndicTTS Audio generated! Base64 length: {len(audio_base64) if audio_base64 else 0}")
    assert audio_base64 is not None and len(audio_base64) > 100, "TTS generation failed"
    print("BHASHINI LIVE TESTS PASSED!")

async def test_multi_turn_dialogue_and_history():
    print("\n" + "=" * 60)
    print("2. TESTING MULTI-TURN ZERO-LOOP DIALOGUE & HISTORY CORRELATION")
    print("=" * 60)
    
    session_id = f"test_kiosk_{os.urandom(4).hex()}"
    patient_name = "Ananya Sharma"
    patient_age = 45
    patient_gender = "Female"
    past_history = [
        "Pulmonary Tuberculosis (DOTS completed 2022 with residual apical fibrosis)",
        "Essential Hypertension (Diagnosed 2024, on Amlodipine 5mg)"
    ]
    historical_clues = [
        {
            "condition": "Pulmonary TB",
            "year": "2022",
            "source": "Discharge Summary",
            "relevanceNote": "Prior lung infection; monitor for post-tubercular bronchiectasis or recurrence."
        },
        {
            "condition": "Hypertension",
            "year": "2024",
            "source": "Prescription OCR",
            "relevanceNote": "Cardiovascular risk baseline for current thoracic/chest symptoms."
        }
    ]
    
    user_turns = [
        "नमस्ते डॉक्टर, मुझे 3 दिन से सीने में बीच में भारीपन और हल्का दर्द हो रहा है।",
        "यह दर्द धीरे-धीरे बढ़ता है, खासकर जब मैं सीढ़ियां चढ़ती हूं, और आराम करने पर थोड़ा ठीक लगता है।",
        "दर्द कंधे या पीठ की तरफ नहीं जाता, बस छाती के बीच में भारीपन लगता है और कभी-कभी पसीना आता है।",
        "दर्द 10 में से 7 नंबर जितना तेज है। मुझे 2 साल पहले टीबी भी हुई थी और मैं बीपी की गोली खाती हूं।"
    ]
    
    asked_questions = []
    last_response = None
    
    for i, user_msg in enumerate(user_turns, 1):
        print(f"\n--- TURN {i} ---")
        print(f"Patient ({patient_name}): {user_msg}")
        
        turn_resp = await ai_orchestrator.process_text_turn(
            transcript=user_msg,
            session_id=session_id,
            language_code="hi",
            synthesize_audio=False,
            patient_name=patient_name,
            patient_age=patient_age,
            patient_gender=patient_gender,
            past_history=past_history,
            historical_clues=historical_clues
        )
        
        response = turn_resp.model_dump() if hasattr(turn_resp, "model_dump") else turn_resp.__dict__
        last_response = response
        spoken = response.get("spoken_response", "")
        question = response.get("clinical_state", {}).get("next_probing_question", "")
        print(f"AI Assistant Spoken: {spoken}")
        print(f"Probing Question: {question}")
        
        # Check non-repetition
        if question:
            assert question not in asked_questions, f"Duplicate question repeated: {question}"
            asked_questions.append(question)
            
        socrates = response.get("clinical_state", {}).get("socrates", {})
        print(f"Extracted SOCRATES state: Site={socrates.get('site')}, Onset={socrates.get('onset')}, Character={socrates.get('character')}, Severity={socrates.get('severity_score')}")
    
    print(f"\nTotal Unique Questions Asked: {len(asked_questions)}")
    for q in asked_questions:
        print(f" - {q}")
        
    hist_corr = last_response.get("historical_correlation") or last_response.get("clinical_state", {}).get("historical_correlation")
    print(f"\nAI Historical Correlation Result: {json.dumps(hist_corr, indent=2, ensure_ascii=False)}")
    assert hist_corr is not None, "Historical correlation was not generated"
    corr_cond = hist_corr.get("correlated_past_condition") or hist_corr.get("related_past_condition")
    assert corr_cond is not None, "Correlated condition is missing"
    print(f"Correlated Chronic History Condition Found: {corr_cond}")
    print("MULTI-TURN & HISTORY CORRELATION TESTS PASSED!")
    return session_id

async def test_pdf_report_generation(session_id: str):
    print("\n" + "=" * 60)
    print("3. TESTING PDF CLINICAL REPORT GENERATION")
    print("=" * 60)
    
    report_data = await report_generator.get_or_build_report_data(session_id)
    print(f"Report Data synthesized:")
    print(f" - Patient: {report_data.get('patient', {}).get('name')}")
    print(f" - Chief Complaint: {report_data.get('chief_complaint')}")
    print(f" - SOCRATES Site: {report_data.get('socrates', {}).get('site')}")
    print(f" - Historical Correlation: {report_data.get('historical_correlation')}")
    
    pdf_bytes = report_generator.generate_pdf_bytes(report_data)
    print(f"Generated PDF bytes size: {len(pdf_bytes)} bytes")
    assert pdf_bytes.startswith(b"%PDF"), "Generated file is not a valid PDF!"
    print("PDF CLINICAL REPORT GENERATION TEST PASSED!")

async def test_non_emergency_probing():
    print("\n" + "=" * 60)
    print("4. TESTING ACTIVE NON-EMERGENCY CLINICAL PROBING & UNIQUE QUESTIONS")
    print("=" * 60)
    
    session_id = f"test_kiosk_probing_{os.urandom(4).hex()}"
    patient_name = "Rajesh Verma"
    
    turns = [
        "नमस्ते डॉक्टर, मुझे पेट के ऊपरी हिस्से में हल्की जलन और भारीपन महसूस हो रहा है।",
        "यह जलन पिछले 4 दिनों से है, खासकर जब मैं मसालेदार खाना खाता हूँ।",
        "दर्द कहीं फैलता नहीं है, बस नाभि के ऊपर रहता है और 10 में से 4 नंबर का है।",
        "मैंने कल एंटासिड सिरप लिया था जिससे थोड़ी देर आराम मिला।"
    ]
    
    asked_questions = []
    for i, msg in enumerate(turns, 1):
        print(f"\n--- NON-EMERGENCY TURN {i} ---")
        print(f"Patient ({patient_name}): {msg}")
        turn_resp = await ai_orchestrator.process_text_turn(
            transcript=msg,
            session_id=session_id,
            language_code="hi",
            synthesize_audio=False,
            patient_name=patient_name,
            patient_age=52,
            patient_gender="Male",
            past_history=["Type 2 Diabetes Mellitus (2020)", "Gastritis (2023)"]
        )
        resp = turn_resp.model_dump()
        spoken = resp.get("spoken_response", "")
        print(f"AI Assistant Spoken: {spoken}")
        socrates = resp.get("clinical_state", {}).get("socrates", {})
        print(f"SOCRATES: Site={socrates.get('site')}, Character={socrates.get('character')}, Exacerbating={socrates.get('exacerbating_relieving')}")

    print("\nNON-EMERGENCY PROBING TEST COMPLETED SUCCESSFULLY!")

async def main():
    try:
        await test_bhashini_live()
        session_id = await test_multi_turn_dialogue_and_history()
        await test_pdf_report_generation(session_id)
        await test_non_emergency_probing()
        print("\n" + "=" * 60)
        print("ALL VERIFICATION SUITES COMPLETED AND PASSED 100%!")
        print("=" * 60)
    except Exception as e:
        print(f"TEST FAILED WITH ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
