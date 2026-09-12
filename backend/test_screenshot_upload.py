import httpx
import asyncio

async def test():
    with open('sample_doctor_prescription.png', 'rb') as f:
        bytes_data = f.read()
    files = {'file': ('Screenshot 2026-09-12 005409.png', bytes_data, 'image/png')}
    data = {'patient_id': 'P-DEMO-001'}
    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.post('http://127.0.0.1:8000/api/v1/documents/upload', files=files, data=data)
        print('HTTP Status:', res.status_code)
        doc = res.json()
        print('Document ID:', doc.get('document_id'))
        print('Document Type:', doc.get('document_type'))
        print('Document Purpose:', doc.get('document_purpose'))
        print('Doctor Name:', doc.get('doctor_name'))
        print('Facility:', doc.get('facility_name'))
        print('\nClinical Intent:\n ', doc.get('clinical_intent'))
        print('\nAction Plan:\n ', doc.get('physician_action_plan'))
        meds = doc.get('extracted_medications', [])
        print(f'\nExtracted Medications ({len(meds)}):')
        for idx, m in enumerate(meds, 1):
            print(f'  {idx}. {m.get("name")} | Dose: {m.get("dosage")} | Freq: {m.get("frequency")}')
            print(f'     • Class: {m.get("therapeutic_class")} | Indication: {m.get("indication")}')
            print(f'     • Purpose: {m.get("clinical_purpose")}')
        
        diagnoses = doc.get('extracted_diagnoses', [])
        print(f'\nDiagnoses ({len(diagnoses)}):')
        for d in diagnoses:
            print(f'  • {d.get("condition")} (ICD-10: {d.get("icd10_code")})')
            
        vitals = doc.get('extracted_vitals', [])
        print(f'\nVitals ({len(vitals)}):')
        for v in vitals:
            print(f'  • {v.get("vital_name")}: {v.get("value")} {v.get("unit") or ""}')

if __name__ == '__main__':
    asyncio.run(test())
