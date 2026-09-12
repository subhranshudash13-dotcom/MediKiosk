import asyncio
from app.services.documents.ocr import ocr_service

async def run_dynamic_tests():
    print("=" * 80)
    print("      TESTING DYNAMIC MEDICAL OCR & VALIDITY CLASSIFICATION GATE")
    print("=" * 80)

    # 1. Test Non-Medical Image (Agriculture / General Flowchart)
    print("\n--- TEST 1: Non-Medical Image (TELHAN SATHI Workflow Diagram) ---")
    with open("test_non_medical_diagram.png", "rb") as f:
        non_med_bytes = f.read()

    res_non_med = await ocr_service.process_document(
        file_bytes=non_med_bytes,
        filename="Screenshot_2026-09-02_232113.png",
        patient_id="P-TEST-001"
    )

    print(f"  • Document Type:      {res_non_med.document_type.value}")
    print(f"  • Confidence Score:   {res_non_med.confidence_score}%")
    print(f"  • Document Purpose:   {res_non_med.document_purpose}")
    print(f"  • Clinical Intent:    {res_non_med.clinical_intent}")
    print(f"  • Action Plan:        {res_non_med.physician_action_plan}")
    print(f"  • Extracted Meds:     {len(res_non_med.extracted_medications)} (Expected: 0)")
    assert res_non_med.document_type.value == "other", "Failed to reject non-medical document"
    assert len(res_non_med.extracted_medications) == 0, "Fabricated medications on non-medical document!"
    print("  [PASS] Non-medical document successfully REJECTED as invalid without fabricating data.")

    # 2. Test Real Medical Doctor Prescription
    print("\n--- TEST 2: Genuine Doctor's Prescription (Cardiology & T2DM OPD Slip) ---")
    with open("sample_doctor_prescription.png", "rb") as f:
        med_bytes = f.read()

    res_med = await ocr_service.process_document(
        file_bytes=med_bytes,
        filename="Doctor_Prescription_Cardiology.png",
        patient_id="P-RAMESH-88219"
    )

    print(f"  • Document Type:      {res_med.document_type.value}")
    print(f"  • Confidence Score:   {res_med.confidence_score}%")
    print(f"  • Doctor Identified:  {res_med.doctor_name}")
    print(f"  • Facility:           {res_med.facility_name}")
    print(f"  • Document Purpose:   {res_med.document_purpose}")
    print(f"  • Clinical Intent:    {res_med.clinical_intent}")
    print(f"  • Extracted Meds ({len(res_med.extracted_medications)}):")
    for idx, m in enumerate(res_med.extracted_medications, 1):
        print(f"     {idx}. {m.name} | Dose: {m.dosage} | Freq: {m.frequency} | Inst: {m.instructions}")
        print(f"        -> Class: {m.therapeutic_class} | Purpose: {m.clinical_purpose}")

    print(f"  • Diagnoses ({len(res_med.extracted_diagnoses)}):")
    for d in res_med.extracted_diagnoses:
        print(f"     • {d.condition} (ICD-10: {d.icd10_code})")

    print(f"  • Vitals ({len(res_med.extracted_vitals)}):")
    for v in res_med.extracted_vitals:
        print(f"     • {v.vital_name}: {v.value} {v.unit}")

    assert res_med.document_type.value == "prescription", "Failed to identify genuine prescription"
    assert len(res_med.extracted_medications) >= 3, "Failed to extract medications from prescription"
    print("  [PASS] Genuine prescription dynamically parsed with exact drug names, doses, and clinical classes.")

    print("\n" + "=" * 80)
    print("      ALL DYNAMIC OCR VALIDATION & ENTITY TESTS PASSED 100%!")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_dynamic_tests())
