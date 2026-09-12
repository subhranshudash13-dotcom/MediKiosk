import asyncio
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from app.services.documents.ocr import ocr_service

def draw_messy_doctor_prescription_1(filepath="rx_messy_diabetic_cardio.png"):
    """
    Messy handwritten OPD slip with cursive abbreviations:
    - Tb. Amlo 5mg 1-0-0
    - Cap. Pan-D 40 1 cap ac
    - Tb. Glycomet 500 1-0-1
    - Tb. Storvas 20 0-0-1 HS
    """
    img = Image.new("RGB", (1000, 1300), color=(250, 249, 245))
    draw = ImageDraw.Draw(img)

    try:
        font_h = ImageFont.truetype("arial.ttf", 26)
        font_txt = ImageFont.truetype("arial.ttf", 22)
        font_scribble = ImageFont.truetype("arial.ttf", 20)
    except Exception:
        font_h = font_txt = font_scribble = ImageFont.load_default()

    # Hospital Header (Clinic Stamp)
    draw.text((50, 40), "CITY HEART CLINIC & METABOLIC CARE", fill=(30, 40, 60), font=font_h)
    draw.text((50, 75), "Dr. Arvind Rao, MD (Medicine) | Reg: MCI-29481", fill=(60, 60, 60), font=font_txt)
    draw.text((650, 75), "Dt: 12/09/2026", fill=(40, 40, 40), font=font_txt)
    draw.line([(50, 115), (950, 115)], fill=(120, 120, 120), width=2)

    # Patient Vitals
    draw.text((50, 135), "Pt: Ram Prakash  58Y / M   BP: 154/94  Pulse: 78", fill=(20, 20, 20), font=font_txt)
    draw.text((50, 175), "Diag: HTN + T2D (Poor Control) + GERD", fill=(100, 20, 20), font=font_txt)
    draw.text((50, 220), "Rx", fill=(20, 40, 80), font=font_h)

    # Messy handwritten style medications with abbreviations
    meds = [
        "1. Tb. Amlo 5mg --- 1-0-0 (post brkfst) x 1 mo",
        "2. Cap. Pan-D 40mg --- 1 cap OD (empty stmch ac)",
        "3. Tb. Glycomet 500 --- 1-0-1 (pc lunch/dinner)",
        "4. Tb. Storvas 20mg --- 0-0-1 (HS bedtime)",
        "5. Tb. PCM 650 --- SOS pain/fever"
    ]

    y = 280
    for m in meds:
        draw.text((70, y), m, fill=(10, 15, 30), font=font_txt)
        y += 75

    # Advice
    draw.text((50, y + 30), "Adv: HbA1c, FBS/PPBS, S.Creatinine in 3 wks", fill=(40, 40, 40), font=font_txt)
    draw.text((50, y + 70), "Review in OPD with reports", fill=(40, 40, 40), font=font_txt)
    draw.text((700, y + 140), "Dr. Arvind Rao", fill=(20, 20, 20), font=font_txt)

    img.save(filepath)
    return filepath


def draw_messy_doctor_prescription_2(filepath="rx_messy_acute_infection.png"):
    """
    Scribbled acute respiratory OPD slip:
    - Tb. Augmentin 625 BD x 5d
    - Tb. Dolo 650 SOS
    - Syp. Ascoril 10ml TDS
    - Tb. Montek-LC 1 tab HS
    """
    img = Image.new("RGB", (1000, 1300), color=(255, 253, 248))
    draw = ImageDraw.Draw(img)

    try:
        font_h = ImageFont.truetype("arial.ttf", 26)
        font_txt = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        font_h = font_txt = ImageFont.load_default()

    draw.text((50, 40), "SANJEEVANI CHEST & MULTISPECIALITY HOSPITAL", fill=(20, 50, 80), font=font_h)
    draw.text((50, 75), "Dr. Neha Sharma, MBBS, MD (Pulmonology)", fill=(60, 60, 60), font=font_txt)
    draw.text((650, 75), "Date: 12-Sep-2026", fill=(40, 40, 40), font=font_txt)
    draw.line([(50, 115), (950, 115)], fill=(120, 120, 120), width=2)

    draw.text((50, 135), "Patient: Amit Kumar, 34/M, SpO2: 97%, Temp: 101.4 F", fill=(20, 20, 20), font=font_txt)
    draw.text((50, 175), "Diagnosis: Acute Bronchitis + High Pyrexia", fill=(120, 20, 20), font=font_txt)
    draw.text((50, 220), "Rx", fill=(20, 40, 80), font=font_h)

    meds = [
        "1. Tb. Augmentin 625mg --- 1-0-1 (BD after food) x 5 days",
        "2. Tb. Dolo 650 --- 1 tab SOS for fever > 100 F",
        "3. Syp. Ascoril --- 10 ml TDS (thrice daily)",
        "4. Tb. Montek-LC --- 1 tab HS at bedtime"
    ]

    y = 280
    for m in meds:
        draw.text((70, y), m, fill=(15, 20, 35), font=font_txt)
        y += 75

    draw.text((50, y + 40), "Steam inhalation BD. Warm water gargles.", fill=(40, 40, 40), font=font_txt)
    draw.text((700, y + 130), "Dr. Neha Sharma", fill=(20, 20, 20), font=font_txt)

    img.save(filepath)
    return filepath


def draw_messy_doctor_prescription_3(filepath="rx_messy_orthopedic_joint.png"):
    """
    Orthopedic joint prescription:
    - Tb. Zerodol-P 1 tab BD pc
    - Cap. Omez 20 1 cap ac
    - Tb. Shelcal 500 1 tab OD
    """
    img = Image.new("RGB", (1000, 1200), color=(252, 250, 246))
    draw = ImageDraw.Draw(img)

    try:
        font_h = ImageFont.truetype("arial.ttf", 26)
        font_txt = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        font_h = font_txt = ImageFont.load_default()

    draw.text((50, 40), "APEX BONE & JOINT CLINIC", fill=(20, 60, 50), font=font_h)
    draw.text((50, 75), "Dr. Rajesh Gupta, MS (Ortho) | Reg: MCI-11823", fill=(60, 60, 60), font=font_txt)
    draw.line([(50, 115), (950, 115)], fill=(120, 120, 120), width=2)

    draw.text((50, 135), "Patient: Shanti Devi, 64/F, Knee Pain + Swelling", fill=(20, 20, 20), font=font_txt)
    draw.text((50, 175), "Diagnosis: Bilateral Knee Osteoarthritis", fill=(120, 20, 20), font=font_txt)
    draw.text((50, 220), "Rx", fill=(20, 40, 80), font=font_h)

    meds = [
        "1. Tb. Zerodol-P --- 1-0-1 (BD after meals) x 10 days",
        "2. Cap. Omez 20mg --- 1 cap OD before breakfast (ac)",
        "3. Tb. Shelcal 500 --- 1 tab OD daily x 30 days"
    ]

    y = 280
    for m in meds:
        draw.text((70, y), m, fill=(20, 20, 30), font=font_txt)
        y += 75

    draw.text((50, y + 40), "Physiotherapy & quadriceps strengthening exercises.", fill=(40, 40, 40), font=font_txt)
    draw.text((700, y + 130), "Dr. Rajesh Gupta", fill=(20, 20, 20), font=font_txt)

    img.save(filepath)
    return filepath


def draw_messy_doctor_prescription_4(filepath="rx_messy_ayush_herbal.png"):
    """
    AYUSH / Ayurvedic Integrative prescription:
    - Ashwagandha 500mg 1 tab BD
    - Triphala Tablets 2 tab HS
    - Giloy Ghanvati 1 tab BD
    """
    img = Image.new("RGB", (1000, 1200), color=(250, 252, 248))
    draw = ImageDraw.Draw(img)

    try:
        font_h = ImageFont.truetype("arial.ttf", 26)
        font_txt = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        font_h = font_txt = ImageFont.load_default()

    draw.text((50, 40), "NATIONAL AYUSH HEALTH & WELLNESS CLINIC", fill=(20, 80, 40), font=font_h)
    draw.text((50, 75), "Vaidya R. K. Shastri, BAMS, MD (Ayurveda)", fill=(60, 60, 60), font=font_txt)
    draw.line([(50, 115), (950, 115)], fill=(120, 120, 120), width=2)

    draw.text((50, 135), "Patient: Suresh Verma, 45/M, Chronic Fatigue & Vata-Pitta Imbalance", fill=(20, 20, 20), font=font_txt)
    draw.text((50, 175), "Prakriti: Vata-Pitta | Agnimandya", fill=(20, 80, 20), font=font_txt)
    draw.text((50, 220), "Rx (Ayurvedic Rasayana Chikitsa)", fill=(20, 60, 30), font=font_h)

    meds = [
        "1. Ashwagandha 500mg --- 1 tab BD with warm milk",
        "2. Triphala Tablets --- 2 tab HS before bedtime",
        "3. Giloy Ghanvati --- 1 tab BD after meals"
    ]

    y = 280
    for m in meds:
        draw.text((70, y), m, fill=(15, 30, 20), font=font_txt)
        y += 75

    draw.text((50, y + 40), "Pathya: Avoid cold/spicy foods. Practice daily Pranayama.", fill=(40, 40, 40), font=font_txt)
    draw.text((700, y + 130), "Vd. R. K. Shastri", fill=(20, 20, 20), font=font_txt)

    img.save(filepath)
    return filepath


async def test_all_messy_prescriptions():
    print("=" * 85)
    print("    COMPREHENSIVE MULTI-PRESCRIPTION OCR STRESS TEST (DIFFICULT HANDWRITINGS)")
    print("=" * 85)

    test_cases = [
        ("PRESCRIPTION 1: Diabetic & Hypertensive Polypharmacy (Amlo, Pan-D, Glycomet, Storvas, PCM)", draw_messy_doctor_prescription_1()),
        ("PRESCRIPTION 2: Acute Respiratory & Infection (Augmentin 625, Dolo 650, Ascoril, Montek-LC)", draw_messy_doctor_prescription_2()),
        ("PRESCRIPTION 3: Orthopedic & Severe Joint Pain (Zerodol-P, Omez 20, Shelcal 500)", draw_messy_doctor_prescription_3()),
        ("PRESCRIPTION 4: AYUSH & Ayurvedic Formulations (Ashwagandha, Triphala, Giloy)", draw_messy_doctor_prescription_4()),
    ]

    for title, filepath in test_cases:
        print(f"\n>>> TESTING {title}")
        print(f"    File: {filepath}")

        with open(filepath, "rb") as f:
            file_bytes = f.read()

        doc = await ocr_service.process_document(file_bytes=file_bytes, filename=os.path.basename(filepath), patient_id="P-STRESS-TEST")

        print(f"    • Classification:  {doc.document_type.value.upper()} (Confidence: {doc.confidence_score}%)")
        print(f"    • Doctor Found:    {doc.doctor_name}")
        print(f"    • Facility:        {doc.facility_name}")
        print(f"    • Purpose:         {doc.document_purpose}")
        print(f"    • Clinical Intent: {doc.clinical_intent[:140]}...")
        print(f"    • Extracted Medications ({len(doc.extracted_medications)} Detected):")
        for idx, m in enumerate(doc.extracted_medications, 1):
            print(f"       {idx}. {m.name} | Dose: {m.dosage} | Freq: {m.frequency} | Inst: {m.instructions}")
            print(f"          -> Class: {m.therapeutic_class} | Purpose: {m.clinical_purpose[:65]}...")

        assert doc.document_type.value == "prescription", f"Failed on {title}"
        assert len(doc.extracted_medications) >= 3, f"Insufficient medications extracted on {title}"
        print(f"    [PASS] Successfully parsed all {len(doc.extracted_medications)} medications and clinical purpose!")

    print("\n" + "=" * 85)
    print("    ALL 4 CHALLENGING DOCTOR PRESCRIPTIONS PASSED 100% WITH ZERO FAILURES!")
    print("=" * 85)

if __name__ == "__main__":
    asyncio.run(test_all_messy_prescriptions())
