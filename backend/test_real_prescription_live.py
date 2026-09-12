import httpx
import asyncio

img_path = r'C:/Users/Hp/.gemini/antigravity-ide/brain/03bb6c1b-96d1-4135-880a-853f0c4eee4d/.user_uploaded/media_1789162217513.png'
with open(img_path, 'rb') as f:
    bytes_data = f.read()

files = {'file': ('Doctor_Prescription_Vivek_AIMS.png', bytes_data, 'image/png')}
data = {'patient_id': 'P-DEMO-001'}

async def test_live_api():
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post('http://127.0.0.1:8000/api/v1/documents/upload', files=files, data=data)
        print('HTTP Status:', res.status_code)
        doc = res.json()
        print('Document ID:', doc.get('document_id'))
        print('Document Type:', doc.get('document_type'))
        print('Document Purpose:', doc.get('document_purpose'))
        print('Facility:', doc.get('facility_name'))
        print('Doctor:', doc.get('doctor_name'))
        print('Date:', doc.get('document_date'))
        print('\nClinical Intent:\n', doc.get('clinical_intent'))
        print('\nAction Plan:\n', doc.get('physician_action_plan'))
        meds = doc.get('extracted_medications') or []
        print(f'\nMedications ({len(meds)}):')
        for idx, m in enumerate(meds, 1):
            print(f"  {idx}. {m.get('name')} | {m.get('dosage')} | {m.get('frequency')} | Route: {m.get('route')}")
            print(f"     Purpose: {m.get('clinical_purpose')}")
        diags = doc.get('extracted_diagnoses') or []
        print(f'\nDiagnoses ({len(diags)}):')
        for d in diags:
            print(f"  • {d.get('condition')} (ICD-10: {d.get('icd10_code')}) [{d.get('condition_type')}]")
        vitals = doc.get('extracted_vitals') or []
        print(f'\nVitals ({len(vitals)}):')
        for v in vitals:
            print(f"  • {v.get('vital_name')}: {v.get('value')} {v.get('unit') or ''}")
        labs = doc.get('extracted_labs') or []
        print(f'\nLabs ({len(labs)}):')
        for l in labs:
            print(f"  • {l.get('test_name')}: {l.get('value')} {l.get('unit')} | Abnormal: {l.get('is_abnormal')} | Severity: {l.get('severity_flag')}")
            print(f"    Significance: {l.get('clinical_significance')}")

if __name__ == '__main__':
    asyncio.run(test_live_api())
