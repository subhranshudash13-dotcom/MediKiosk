import re
from typing import Optional, Tuple, Dict, Any
from app.models.documents import SeverityLevel

# Standard reference ranges and critical thresholds common in adult outpatient clinical practice
REFERENCE_RANGES_DB: Dict[str, Dict[str, Any]] = {
    "hba1c": {
        "canonical_name": "Glycated Hemoglobin (HbA1c)",
        "unit": "%",
        "normal_low": 4.0,
        "normal_high": 5.6,
        "borderline_high": 6.4,  # 5.7 - 6.4 is Prediabetes
        "critical_high": 9.0,   # Poor glycemic control / high risk of microvascular damage
        "range_display": "< 5.7%",
        "aliases": ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin", "a1c"]
    },
    "fasting_blood_glucose": {
        "canonical_name": "Fasting Blood Sugar (FBS)",
        "unit": "mg/dL",
        "normal_low": 70.0,
        "normal_high": 100.0,
        "borderline_high": 125.0,  # 100 - 125 is Impaired Fasting Glucose
        "critical_high": 250.0,
        "critical_low": 54.0,
        "range_display": "70 - 100 mg/dL",
        "aliases": ["fbs", "fasting blood sugar", "fasting glucose", "blood glucose fasting", "fbg"]
    },
    "postprandial_blood_glucose": {
        "canonical_name": "Post-Prandial Blood Sugar (PPBS)",
        "unit": "mg/dL",
        "normal_low": 90.0,
        "normal_high": 140.0,
        "borderline_high": 199.0,
        "critical_high": 300.0,
        "range_display": "< 140 mg/dL",
        "aliases": ["ppbs", "post prandial blood sugar", "postprandial glucose", "pp glucose", "2hr post glucose"]
    },
    "serum_creatinine": {
        "canonical_name": "Serum Creatinine",
        "unit": "mg/dL",
        "normal_low": 0.6,
        "normal_high": 1.2,
        "borderline_high": 1.5,
        "critical_high": 2.5,   # Acute Kidney Injury / Advanced CKD alert
        "range_display": "0.6 - 1.2 mg/dL",
        "aliases": ["serum creatinine", "creatinine", "s. creatinine", "s. creat", "creat"]
    },
    "blood_urea": {
        "canonical_name": "Blood Urea",
        "unit": "mg/dL",
        "normal_low": 15.0,
        "normal_high": 45.0,
        "borderline_high": 60.0,
        "critical_high": 100.0,
        "range_display": "15 - 45 mg/dL",
        "aliases": ["blood urea", "urea", "s. urea", "serum urea", "bun"]
    },
    "hemoglobin": {
        "canonical_name": "Hemoglobin (Hb)",
        "unit": "g/dL",
        "normal_low": 12.0,
        "normal_high": 17.5,
        "critical_low": 7.0,    # Severe Anemia alert
        "range_display": "12.0 - 17.5 g/dL",
        "aliases": ["hemoglobin", "haemoglobin", "hb", "total hb"]
    },
    "total_cholesterol": {
        "canonical_name": "Total Cholesterol",
        "unit": "mg/dL",
        "normal_low": 100.0,
        "normal_high": 200.0,
        "borderline_high": 239.0,
        "critical_high": 280.0,
        "range_display": "< 200 mg/dL",
        "aliases": ["total cholesterol", "serum cholesterol", "s. cholesterol", "cholesterol"]
    },
    "triglycerides": {
        "canonical_name": "Serum Triglycerides",
        "unit": "mg/dL",
        "normal_low": 50.0,
        "normal_high": 150.0,
        "borderline_high": 199.0,
        "critical_high": 500.0,  # Risk of acute pancreatitis
        "range_display": "< 150 mg/dL",
        "aliases": ["triglycerides", "serum triglycerides", "tg", "s. triglycerides"]
    },
    "sgpt": {
        "canonical_name": "Alanine Aminotransferase (SGPT / ALT)",
        "unit": "U/L",
        "normal_low": 5.0,
        "normal_high": 45.0,
        "borderline_high": 80.0,
        "critical_high": 200.0,  # Acute hepatic injury
        "range_display": "5 - 45 U/L",
        "aliases": ["sgpt", "alt", "alanine aminotransferase", "s. alt"]
    },
    "platelet_count": {
        "canonical_name": "Platelet Count",
        "unit": "lakh/cumm",
        "normal_low": 1.5,
        "normal_high": 4.5,
        "critical_low": 0.5,    # Thrombocytopenia / bleeding risk (common in Dengue)
        "range_display": "1.5 - 4.5 lakh/cumm",
        "aliases": ["platelet count", "platelets", "plt"]
    },
}


def _extract_numeric_value(raw_val: str) -> Optional[float]:
    """Extract float number from strings like '9.2 %', '> 250', '140mg/dl', '1.4'."""
    if not raw_val:
        return None
    match = re.search(r"[-+]?\d*\.?\d+", str(raw_val).replace(",", ""))
    if match:
        try:
            return float(match.group(0))
        except ValueError:
            return None
    return None


def evaluate_lab_result(test_name: str, raw_value: str) -> Tuple[bool, SeverityLevel, Optional[str], Optional[str], Optional[str]]:
    """
    Evaluates a lab test against clinical thresholds.
    Returns: (is_abnormal, severity_flag, standard_range, unit, clinical_significance)
    """
    cleaned_test = test_name.lower().strip()
    num_val = _extract_numeric_value(raw_value)

    # Find matching canonical test in database
    matched_config = None
    for key, config in REFERENCE_RANGES_DB.items():
        if key in cleaned_test or any(alias in cleaned_test for alias in config["aliases"]):
            matched_config = config
            break

    if not matched_config or num_val is None:
        # Check simple textual keywords if no range config matched
        lower_val = str(raw_value).lower()
        if "positive" in lower_val or "reactive" in lower_val or "high" in lower_val:
            return True, SeverityLevel.ELEVATED, "Negative / Non-reactive", None, "Positive finding noted"
        return False, SeverityLevel.NORMAL, None, None, None

    normal_low = matched_config.get("normal_low")
    normal_high = matched_config.get("normal_high")
    borderline_high = matched_config.get("borderline_high")
    critical_high = matched_config.get("critical_high")
    critical_low = matched_config.get("critical_low")
    range_display = matched_config.get("range_display")
    unit = matched_config.get("unit")
    name = matched_config.get("canonical_name", test_name)

    # Critical Low check
    if critical_low is not None and num_val < critical_low:
        return True, SeverityLevel.CRITICAL_LOW, range_display, unit, f"CRITICAL LOW: Significantly below normal threshold for {name}"

    # Critical High check
    if critical_high is not None and num_val >= critical_high:
        return True, SeverityLevel.CRITICAL_HIGH, range_display, unit, f"CRITICAL HIGH: Severely elevated {name} requiring clinical attention"

    # Borderline High / High
    if normal_high is not None and num_val > normal_high:
        if borderline_high is not None and num_val <= borderline_high:
            return True, SeverityLevel.BORDERLINE, range_display, unit, f"Borderline elevated {name}"
        return True, SeverityLevel.ELEVATED, range_display, unit, f"Elevated {name}"

    # Low check
    if normal_low is not None and num_val < normal_low:
        return True, SeverityLevel.BORDERLINE, range_display, unit, f"Below normal range for {name}"

    # Normal
    return False, SeverityLevel.NORMAL, range_display, unit, f"Normal {name}"
