import httpx
import asyncio

async def test():
    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1. Non-medical flowchart test
        with open('test_non_medical_diagram.png', 'rb') as f:
            b1 = f.read()
        res1 = await client.post(
            'http://127.0.0.1:8000/api/v1/documents/upload',
            files={'file': ('Screenshot_2026-09-02_232113.png', b1, 'image/png')},
            data={'patient_id': 'P-DEMO-001'}
        )
        doc1 = res1.json()
        print('=== TEST 1: Non-medical Diagram Upload (TELHAN SATHI Workflow) ===')
        print('HTTP Status:', res1.status_code)
        print('Doc Type:', doc1.get('document_type'))
        print('Confidence:', doc1.get('confidence_score'))
        print('Doc Purpose:', doc1.get('document_purpose'))
        print('Clinical Intent:\n ', doc1.get('clinical_intent'))
        print('Physician Action Plan:\n ', doc1.get('physician_action_plan'))
        print('Meds Extracted:', len(doc1.get('extracted_medications', [])))

        # 2. Genuine doctor prescription test
        with open('sample_doctor_prescription.png', 'rb') as f:
            b2 = f.read()
        res2 = await client.post(
            'http://127.0.0.1:8000/api/v1/documents/upload',
            files={'file': ('Doctor_Prescription_Cardiology.png', b2, 'image/png')},
            data={'patient_id': 'P-DEMO-001'}
        )
        doc2 = res2.json()
        print('\n=== TEST 2: Real Doctor Prescription Upload ===')
        print('HTTP Status:', res2.status_code)
        print('Doc Type:', doc2.get('document_type'))
        print('Confidence:', doc2.get('confidence_score'))
        print('Doctor Name:', doc2.get('doctor_name'))
        print('Facility:', doc2.get('facility_name'))
        print('Doc Purpose:', doc2.get('document_purpose'))
        print('Clinical Intent:\n ', doc2.get('clinical_intent'))
        meds = doc2.get('extracted_medications', [])
        print(f'Meds Extracted ({len(meds)}):')
        for idx, m in enumerate(meds, 1):
            print(f'  {idx}. {m.get("name")} | Dose: {m.get("dosage")} | Freq: {m.get("frequency")} | Inst: {m.get("instructions")}')

if __name__ == '__main__':
    asyncio.run(test())
