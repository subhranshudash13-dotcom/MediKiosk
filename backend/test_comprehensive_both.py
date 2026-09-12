import asyncio
from app.services.documents.ocr import ocr_service

async def test_both():
    # 1. Aman's prescription
    print("==================== TEST 1: AMAN (SAI RAM CLINIC) ====================")
    with open(r'C:/Users/Hp/.gemini/antigravity-ide/brain/03bb6c1b-96d1-4135-880a-853f0c4eee4d/.user_uploaded/media_1789163080883.png', 'rb') as f:
        bytes_aman = f.read()
    doc_aman = await ocr_service.process_document(bytes_aman, filename='Aman_SaiRamClinic.png')
    print('Facility:', doc_aman.facility_name)
    print('Doctor:', doc_aman.doctor_name)
    print('Date:', doc_aman.document_date)
    print('Purpose:', doc_aman.document_purpose)
    print('\nClinical Intent:\n', doc_aman.clinical_intent)
    print('\nAction Plan:\n', doc_aman.physician_action_plan)
    print(f'\nMedications ({len(doc_aman.extracted_medications)}):')
    for m in doc_aman.extracted_medications:
        print(f"  • {m.name} | Dose: {m.dosage} | Freq: {m.frequency} | Qty: {m.duration} | Route: {m.route}")
        print(f"    Class: {m.therapeutic_class}")
        print(f"    Purpose: {m.clinical_purpose}")
        print(f"    Inst: {m.instructions}")
    print(f'\nDiagnoses ({len(doc_aman.extracted_diagnoses)}):')
    for d in doc_aman.extracted_diagnoses:
        print(f"  • {d.condition} (ICD-10: {d.icd10_code}) [{d.condition_type}]")
    print(f'\nVitals ({len(doc_aman.extracted_vitals)}):')
    for v in doc_aman.extracted_vitals:
        print(f"  • {v.vital_name}: {v.value} {v.unit or ''} (Abnormal: {v.is_abnormal})")

    await asyncio.sleep(5)
    print("\n==================== TEST 2: VIVEK (AIMS HOSPITAL) ====================")
    with open(r'C:/Users/Hp/.gemini/antigravity-ide/brain/03bb6c1b-96d1-4135-880a-853f0c4eee4d/.user_uploaded/media_1789162217513.png', 'rb') as f:
        bytes_vivek = f.read()
    doc_vivek = await ocr_service.process_document(bytes_vivek, filename='Vivek_AIMS.png')
    print('Facility:', doc_vivek.facility_name)
    print('Doctor:', doc_vivek.doctor_name)
    print('Date:', doc_vivek.document_date)
    print('Purpose:', doc_vivek.document_purpose)
    print(f'Medications ({len(doc_vivek.extracted_medications)}):')
    for m in doc_vivek.extracted_medications:
        print(f"  • {m.name} | {m.dosage} | {m.frequency} | {m.route}")
    print(f'Diagnoses ({len(doc_vivek.extracted_diagnoses)}):')
    for d in doc_vivek.extracted_diagnoses:
        print(f"  • {d.condition} ({d.icd10_code})")
    print(f'Vitals ({len(doc_vivek.extracted_vitals)}):')
    for v in doc_vivek.extracted_vitals:
        print(f"  • {v.vital_name}: {v.value} {v.unit or ''}")
    print(f'Labs ({len(doc_vivek.extracted_labs)}):')
    for l in doc_vivek.extracted_labs:
        print(f"  • {l.test_name}: {l.value} {l.unit} (Abnormal: {l.is_abnormal})")

if __name__ == '__main__':
    asyncio.run(test_both())
