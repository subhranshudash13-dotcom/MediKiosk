import os
import io
import asyncio
import httpx
from PIL import Image, ImageDraw, ImageFont
from app.services.documents.ocr import ocr_service
from app.core.config import settings

def create_dummy_doctor_prescription(filepath: str = "sample_doctor_prescription.png") -> str:
    """
    Creates a realistic digital doctor's prescription image.
    Contains clinic header, doctor details, patient demographics, vitals,
    clinical diagnosis, Rx medications with strengths & frequencies, and doctor signature.
    """
    width, height = 1200, 1600
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Try loading truetype font or fallback
    try:
        font_title = ImageFont.truetype("arial.ttf", 36)
        font_sub = ImageFont.truetype("arial.ttf", 22)
        font_header = ImageFont.truetype("arial.ttf", 26)
        font_bold = ImageFont.truetype("arialbd.ttf", 24)
        font_body = ImageFont.truetype("arial.ttf", 22)
        font_rx = ImageFont.truetype("arialbd.ttf", 44)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_header = ImageFont.load_default()
        font_bold = ImageFont.load_default()
        font_body = ImageFont.load_default()
        font_rx = ImageFont.load_default()

    # 1. Hospital Header Bar
    draw.rectangle([(0, 0), (width, 160)], fill=(24, 76, 120))
    draw.text((60, 30), "APEX MULTISPECIALITY HOSPITAL & RESEARCH CENTRE", fill=(255, 255, 255), font=font_title)
    draw.text((60, 80), "Department of Internal Medicine & Clinical Cardiology | NABH Accredited", fill=(220, 235, 250), font=font_sub)
    draw.text((60, 115), "Ring Road, Phase-II, New Delhi - 110029 | Tel: +91-11-26598000", fill=(200, 220, 240), font=font_sub)

    # 2. Doctor Info
    draw.text((60, 185), "Dr. S. K. Verma, MD (Medicine), DM (Cardiology)", fill=(20, 50, 90), font=font_bold)
    draw.text((60, 220), "Senior Consultant Physician | Reg. No: MCI-48291/DMC", fill=(80, 80, 80), font=font_body)
    draw.text((800, 185), "Date: 12-Sep-2026", fill=(40, 40, 40), font=font_bold)
    draw.text((800, 220), "OPD Ticket: #OPD-88219", fill=(80, 80, 80), font=font_body)

    # Horizontal divider
    draw.line([(60, 265), (width - 60, 265)], fill=(180, 200, 220), width=3)

    # 3. Patient Demographics & Vitals
    draw.rectangle([(60, 280), (width - 60, 370)], fill=(245, 248, 252), outline=(210, 225, 240), width=2)
    draw.text((80, 295), "Patient Name: Ramesh Chandra", fill=(20, 20, 20), font=font_bold)
    draw.text((450, 295), "Age/Gender: 52 Yrs / Male", fill=(20, 20, 20), font=font_bold)
    draw.text((800, 295), "ABHA ID: 91-4521-8890-1234", fill=(20, 20, 20), font=font_bold)

    draw.text((80, 332), "Vitals Recorded: BP: 148/92 mmHg  |  Pulse: 82 bpm  |  SpO2: 98%  |  Weight: 76 kg", fill=(60, 60, 60), font=font_body)

    # 4. Clinical Diagnosis
    draw.text((60, 395), "CLINICAL DIAGNOSIS / IMPRESSION:", fill=(140, 30, 30), font=font_bold)
    draw.text((60, 430), "1. Essential Hypertension (Stage 2) - Uncontrolled on monotherapy", fill=(30, 30, 30), font=font_body)
    draw.text((60, 465), "2. Type 2 Diabetes Mellitus - Suboptimal glycemic control", fill=(30, 30, 30), font=font_body)
    draw.text((60, 500), "3. Gastroesophageal Reflux Disease (GERD) & Drug-induced Gastritis", fill=(30, 30, 30), font=font_body)

    # Divider
    draw.line([(60, 545), (width - 60, 545)], fill=(180, 200, 220), width=2)

    # 5. Rx Section
    draw.text((60, 565), "Rx (Prescribed Medications)", fill=(24, 76, 120), font=font_rx)

    medications = [
        ("1. Tab. Amlodipine Besylate 5 mg", "1 Tablet Once Daily (1-0-0)", "Morning after breakfast", "30 Days", "For Essential Hypertension"),
        ("2. Tab. Metformin Hydrochloride 500 mg", "1 Tablet Twice Daily (1-0-1)", "Post-lunch & Post-dinner", "30 Days", "For Glycemic Control (T2DM)"),
        ("3. Cap. Pantoprazole DSR 40 mg", "1 Capsule Once Daily (1-0-0)", "Empty stomach (30 mins before breakfast)", "14 Days", "Gastroprotection / Acidity"),
        ("4. Tab. Paracetamol 650 mg (Dolo / Crocin)", "1 Tablet SOS (As needed)", "Only if headache / fever > 100°F", "5 Days", "Symptomatic relief"),
        ("5. Tab. Atorvastatin 20 mg", "1 Tablet at Bedtime (0-0-1)", "Night before sleep", "30 Days", "Dyslipidemia & Cardioprotection")
    ]

    y_pos = 640
    for med_title, dose_freq, timing, duration, ind in medications:
        draw.rectangle([(60, y_pos), (width - 60, y_pos + 105)], fill=(252, 253, 255), outline=(225, 235, 245), width=1)
        draw.text((80, y_pos + 12), med_title, fill=(10, 40, 80), font=font_bold)
        draw.text((580, y_pos + 12), f"Duration: {duration}", fill=(80, 80, 80), font=font_bold)
        draw.text((80, y_pos + 45), f"Dose: {dose_freq}", fill=(40, 40, 40), font=font_body)
        draw.text((500, y_pos + 45), f"Instructions: {timing}", fill=(60, 60, 60), font=font_body)
        draw.text((80, y_pos + 75), f"Indication: {ind}", fill=(100, 100, 100), font=font_body)
        y_pos += 120

    # 6. Lab Investigations Advised
    draw.line([(60, y_pos + 10), (width - 60, y_pos + 10)], fill=(180, 200, 220), width=2)
    draw.text((60, y_pos + 25), "LAB INVESTIGATIONS ADVISED:", fill=(140, 30, 30), font=font_bold)
    draw.text((80, y_pos + 60), "• Glycated Hemoglobin (HbA1c) test - Target < 7.0%", fill=(30, 30, 30), font=font_body)
    draw.text((80, y_pos + 92), "• Fasting & Postprandial Blood Sugar (FBS / PPBS)", fill=(30, 30, 30), font=font_body)
    draw.text((80, y_pos + 124), "• Serum Creatinine, eGFR & Lipid Profile in 4 weeks", fill=(30, 30, 30), font=font_body)

    # 7. General Advice
    draw.text((60, y_pos + 170), "GENERAL ADVICE & LIFESTYLE:", fill=(24, 76, 120), font=font_bold)
    draw.text((80, y_pos + 205), "• Restrict dietary salt (< 5g/day). Avoid fried/oily foods.", fill=(40, 40, 40), font=font_body)
    draw.text((80, y_pos + 235), "• 30 minutes daily moderate brisk walking. Monitor home BP weekly.", fill=(40, 40, 40), font=font_body)
    draw.text((80, y_pos + 265), "• Review in OPD with lab reports on 12-Oct-2026.", fill=(40, 40, 40), font=font_body)

    # 8. Signature Block
    draw.line([(750, y_pos + 330), (1100, y_pos + 330)], fill=(40, 40, 40), width=2)
    draw.text((780, y_pos + 338), "Dr. S. K. Verma, MD", fill=(20, 20, 20), font=font_bold)
    draw.text((780, y_pos + 368), "Reg. No: MCI-48291", fill=(80, 80, 80), font=font_body)

    # Save image
    img.save(filepath, format="PNG")
    print(f"[OK] Generated realistic doctor prescription image at '{filepath}' ({width}x{height})")
    return filepath


async def run_ocr_evaluation():
    print("=" * 75)
    print("      MEDIKIOSK TESSERACT OCR & CLINICAL INTELLIGENCE DEMO")
    print("=" * 75)

    # Step 1: Create sample prescription
    rx_path = create_dummy_doctor_prescription("sample_doctor_prescription.png")
    
    with open(rx_path, "rb") as f:
        file_bytes = f.read()

    # Step 2: Test raw Tesseract OCR directly
    print("\n--- 1. Testing Raw Tesseract OCR Engine & Preprocessing ---")
    pil_img = Image.open(io.BytesIO(file_bytes))
    preprocessed = ocr_service.preprocess_image_for_ocr(pil_img)
    print(f"[OK] Image preprocessed for OCR (Binarization & Adaptive Filtering applied).")

    raw_tesseract_text = ocr_service.run_tesseract_ocr(pil_img)
    print(f"[OK] Tesseract OCR Extracted {len(raw_tesseract_text)} characters.")
    print("--- RAW TESSERACT OCR PREVIEW (First 500 chars) ---")
    print(raw_tesseract_text[:500] if raw_tesseract_text else "[Tesseract binary fallback used]")
    print("-" * 50)

    # Step 3: Run Full Document OCR & Clinical Intelligence Service
    print("\n--- 2. Running DocumentOCRService.process_document() Pipeline ---")
    doc = await ocr_service.process_document(
        file_bytes=file_bytes,
        filename="sample_doctor_prescription.png",
        patient_id="P-DEMO-RAMESH"
    )

    print(f"\n[DOCUMENT METADATA]")
    print(f"  • Document ID:       {doc.document_id}")
    print(f"  • Document Type:     {doc.document_type.value}")
    print(f"  • Document Purpose:  {doc.document_purpose}")
    print(f"  • Doctor Name:       {doc.doctor_name}")
    print(f"  • Facility Name:     {doc.facility_name}")
    print(f"  • Confidence Score:  {doc.confidence_score}%")

    print(f"\n[CLINICAL INTENT]")
    print(f"  {doc.clinical_intent}")

    print(f"\n[PHYSICIAN ACTION PLAN & SAFETY ALERTS]")
    print(f"  {doc.physician_action_plan}")

    print(f"\n[EXTRACTED MEDICATIONS ({len(doc.extracted_medications)} Detected)]")
    for idx, med in enumerate(doc.extracted_medications, 1):
        print(f"  {idx}. {med.name} ({med.dosage or 'N/A'})")
        print(f"     • Frequency:         {med.frequency or 'N/A'}")
        print(f"     • Instructions:      {med.instructions or 'N/A'}")
        print(f"     • Therapeutic Class: {med.therapeutic_class or 'N/A'}")
        print(f"     • Clinical Purpose:  {med.clinical_purpose or 'N/A'}")
        print(f"     • Indication:        {med.indication or 'N/A'}")

    print(f"\n[EXTRACTED DIAGNOSES]")
    for diag in doc.extracted_diagnoses:
        print(f"  • {diag.condition} (Type: {diag.condition_type}, ICD-10: {diag.icd10_code or 'N/A'})")

    print(f"\n[EXTRACTED VITALS]")
    for vital in doc.extracted_vitals:
        print(f"  • {vital.vital_name}: {vital.value} {vital.unit or ''}")

    # Step 4: Test Upload via Live FastAPI Endpoint
    print("\n--- 3. Testing Live Backend API (POST /api/v1/documents/upload) ---")
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            files = {"file": ("sample_doctor_prescription.png", file_bytes, "image/png")}
            data = {"patient_id": "P-RAMESH-88219"}
            res = await client.post("http://127.0.0.1:8000/api/v1/documents/upload", files=files, data=data)
            print(f"  API Response Status: {res.status_code}")
            if res.status_code in (200, 201):
                api_doc = res.json()
                print(f"  [PASS] Document uploaded and parsed successfully in live MongoDB!")
                print(f"  • Saved Document ID: {api_doc.get('document_id')}")
                print(f"  • Extracted Meds:    {len(api_doc.get('extracted_medications', []))}")
            else:
                print(f"  [NOTE] Response: {res.text}")
        except Exception as e:
            print(f"  [NOTE] Live endpoint test: {e}")

    print("\n" + "=" * 75)
    print("      OCR & CLINICAL INTELLIGENCE VERIFICATION COMPLETE")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_ocr_evaluation())
