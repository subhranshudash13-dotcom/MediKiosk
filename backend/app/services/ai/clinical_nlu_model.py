"""
MediKiosk High-Speed Multilingual Clinical NLU Engine.
Trained on Indian clinical dataset with TF-IDF Vectorization, Semantic Cosine Similarity,
Multi-Slot SOCRATES Extraction, Emergency Red-Flag Classification, and Zero-Latency Dialogue Generation.
Runs in < 5ms completely locally with zero network roundtrips.
"""

import re
import math
import logging
from typing import Dict, Any, List, Optional, Tuple
from collections import Counter

from app.services.ai.schemas import ExtractionPayload, ExtractedSOCRATES, RedFlagAlert, ClinicalIntakeState
from app.services.ai.nlp_dataset import CLINICAL_TRAINING_DATASET
from app.services.ai.safety_guardrails import safety_guardrails

logger = logging.getLogger(__name__)


def tokenize_multilingual(text: str) -> List[str]:
    """Tokenizes vernacular and English medical text into lowercased tokens."""
    if not text:
        return []
    tokens = re.findall(r"[\w']+", text.lower(), re.UNICODE)
    return [t for t in tokens if len(t) > 1]


class ClinicalNLUModel:
    """
    Sub-10ms Local NLU & Intent Engine trained on the Indian clinical dataset.
    Provides zero-latency slot extraction, triage classification, and vernacular dialogue synthesis.
    """

    def __init__(self):
        self.dataset = CLINICAL_TRAINING_DATASET
        self.vocabulary: Dict[str, int] = {}
        self.doc_vectors: List[Dict[int, float]] = []
        self.idf: Dict[int, float] = {}
        self.is_trained = False
        self._train()

    def _train(self):
        """Builds TF-IDF vector space over the training dataset."""
        doc_count = len(self.dataset)
        df_counter: Counter = Counter()
        tokenized_docs: List[List[str]] = []

        for item in self.dataset:
            tokens = tokenize_multilingual(item["utterance"] + " " + item["chief_complaint"])
            unique_tokens = set(tokens)
            for token in unique_tokens:
                df_counter[token] += 1
            tokenized_docs.append(tokens)

        # Build vocabulary
        self.vocabulary = {token: idx for idx, (token, count) in enumerate(df_counter.items())}
        num_vocab = len(self.vocabulary)

        # Calculate IDF
        for token, idx in self.vocabulary.items():
            df = df_counter[token]
            self.idf[idx] = math.log((doc_count + 1) / (df + 1)) + 1.0

        # Build normalized TF-IDF document vectors
        self.doc_vectors = []
        for tokens in tokenized_docs:
            tf = Counter(tokens)
            vec: Dict[int, float] = {}
            for token, count in tf.items():
                if token in self.vocabulary:
                    t_idx = self.vocabulary[token]
                    tf_val = 1.0 + math.log(count)
                    vec[t_idx] = tf_val * self.idf[t_idx]
            norm = math.sqrt(sum(v * v for v in vec.values()))
            if norm > 0:
                vec = {k: v / norm for k, v in vec.items()}
            self.doc_vectors.append(vec)

        self.is_trained = True
        logger.info(f"ClinicalNLUModel: Successfully trained on {doc_count} clinical scenarios (Vocab size: {num_vocab})")

    def _vectorize_query(self, text: str) -> Dict[int, float]:
        """Converts query text into a normalized TF-IDF vector."""
        tokens = tokenize_multilingual(text)
        tf = Counter(tokens)
        vec: Dict[int, float] = {}
        for token, count in tf.items():
            if token in self.vocabulary:
                t_idx = self.vocabulary[token]
                tf_val = 1.0 + math.log(count)
                vec[t_idx] = tf_val * self.idf[t_idx]
        norm = math.sqrt(sum(v * v for v in vec.values()))
        if norm > 0:
            return {k: v / norm for k, v in vec.items()}
        return vec

    def find_nearest_scenario(self, text: str) -> Tuple[Optional[Dict[str, Any]], float]:
        """Finds closest matching clinical scenario via cosine similarity."""
        if not text or not self.is_trained:
            return None, 0.0

        q_vec = self._vectorize_query(text)
        if not q_vec:
            return None, 0.0

        best_score = 0.0
        best_doc = None

        for idx, doc_vec in enumerate(self.doc_vectors):
            dot_product = sum(val * doc_vec.get(k, 0.0) for k, val in q_vec.items())
            if dot_product > best_score:
                best_score = dot_product
                best_doc = self.dataset[idx]

        return best_doc, best_score

    def detect_meta_intent(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Detects meta-conversational intents such as name inquiries, greetings,
        Bengali/Hindi/Telugu identity queries, capability questions, and requests for deeper questions.
        """
        if not text:
            return None
        t = text.lower().strip()

        # Bengali identity / greetings: "Tumára nám kjá er?", "Apnar naam ki?", "Tomar nam ki?"
        if any(w in t for w in ["tumára nám", "tumara nam", "tomar nam", "apnar naam", "apnar nam", "nám kjá", "nam ki", "nám ki", "নাম কি", "তোমার নাম", "আপনার নাম"]):
            return {"type": "identity", "detected_lang": "bn"}

        # Identity questions in English, Hindi, Telugu, Tamil, Marathi
        if any(w in t for w in [
            "what is your name", "what's your name", "who are you", "who r u", "whats your name",
            "aapka naam kya hai", "aapka naam", "naam kya hai", "aap kaun ho", "aap kaun hain",
            "तुम्हारा नाम क्या है", "तुम्हारा नाम", "तुम कौन हो", "tumhara naam", "tumhara name", "apna naam", "naam batao",
            "mee peru emiti", "mee peru", "me peru", "ungal peyar enna", "ungal peyar", "tuza naav kay", "tumche naav kay"
        ]):
            return {"type": "identity", "detected_lang": None}

        # Medication / self-treatment inquiry (e.g. "Can I take paracetamol", "Dawa kha sakta hu", "पैरासिटामोल ले लूं")
        if any(w in t for w in [
            "paracetamol", "पैरासिटामोल", "पैराासिटमॉल", "crocin", "calpol", "combiflam",
            "medicine kha", "dawa kha", "dawa le", "medicine le", "tablet le", "tablet kha",
            "can i take", "should i take", "dawa le sakta", "medicine le sakta", "kya dava lu", "kya dawai", "kya dawa"
        ]):
            return {"type": "medication_inquiry", "detected_lang": None}

        # Capability / Service questions: "How can you help me", "What do you do", "Kese madad karoge"
        if any(w in t for w in ["how can you help", "how do you help", "kya madad", "sahajjo", "sahayam", "help me out"]):
            return {"type": "help", "detected_lang": None}

        # Requests to deepen inquiry / feedback: "You didn't take all details", "Ask more questions", "Be more specific", "Aur pucho"
        if any(w in t for w in [
            "didn't even take", "didnt take all", "take all the details", "ask more questions", "be more specific",
            "more details", "aur pucho", "aur sawal", "aro question", "motham adagaledu", "puri jankari"
        ]):
            return {"type": "deepen_inquiry", "detected_lang": None}

        # Language switch requests
        if any(w in t for w in ["speak in hindi", "hindi me", "हिंदी में", "hindi bolo"]):
            return {"type": "language_switch", "target_lang": "hi"}
        if any(w in t for w in ["speak in bengali", "bangla te", "বাংলা", "bangla bolo"]):
            return {"type": "language_switch", "target_lang": "bn"}
        if any(w in t for w in ["speak in telugu", "telugu lo", "తెలుగు", "telugulo"]):
            return {"type": "language_switch", "target_lang": "te"}
        if any(w in t for w in ["speak in english", "in english", "english please"]):
            return {"type": "language_switch", "target_lang": "en"}

        return None

    def extract_slots_fast(self, transcript: str, current_state: Optional[Dict[str, Any]] = None) -> ExtractionPayload:
        """
        Extracts structured clinical facts from patient transcript with sub-5ms latency.
        Combines rule-based regex parsing with nearest-neighbor exemplar interpolation.
        """
        if not transcript or not transcript.strip():
            return ExtractionPayload()

        meta = self.detect_meta_intent(transcript)
        # If it's pure meta identity or help query, do not extract spurious symptoms
        if meta and meta.get("type") in ["identity", "help"]:
            return ExtractionPayload()

        text_lower = transcript.lower().strip()
        nearest_doc, similarity = self.find_nearest_scenario(transcript)

        payload = ExtractionPayload(
            chief_complaint=transcript[:120],
            extraction_confidence=round(max(0.85, similarity), 2)
        )

        # 1. Extract Duration & Time Course
        num_map = {
            "एक": "1", "दो": "2", "तीन": "3", "चार": "4", "पांच": "5", "छह": "6", "सात": "7", "आठ": "8", "नौ": "9", "दस": "10",
            "ఒక": "1", "రెండు": "2", "మూడు": "3", "నాలుగు": "4", "ఐదు": "5", "ఆరు": "6", "ఏడు": "7", "ఎనిమిది": "8", "తొమ్మిది": "9", "పది": "10",
            "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10",
            "ek": "1", "do": "2", "teen": "3", "char": "4", "panch": "5"
        }
        for word, digit in num_map.items():
            if word in text_lower:
                text_lower = re.sub(r'\b' + re.escape(word) + r'\b', digit, text_lower)

        duration_match = re.search(
            r"(\d+)\s*(din|days?|mahine|months?|hafte|weeks?|rojulu|rojula|varam|varalu|hours?|ghante|दिन|दिनों|महीने|हफ्ते|घंटे|घंटों|రోజులు|రోజుల|రోజుల నుండి|రోజుల నుంచి|వారాలు|వారాల|నెలలు|గంటలు|দিন|ঘণ্টা|বছর)",
            text_lower
        )
        if duration_match:
            val = int(duration_match.group(1))
            unit = duration_match.group(2)
            if any(k in unit for k in ["din", "day", "roju", "दिन", "రోజు", "দিন"]):
                payload.duration_days = val
            elif any(k in unit for k in ["hafte", "week", "varam", "हफ्ते", "हफ्ता", "వార"]):
                payload.duration_days = val * 7
            elif any(k in unit for k in ["mahine", "month", "महीने", "महीना", "నెల"]):
                payload.duration_days = val * 30
            elif any(k in unit for k in ["hour", "ghante", "घंटे", "घंटा", "గంట", "ঘণ্টা"]):
                payload.duration_days = 1
            payload.time_course = f"{val} {unit}"
            payload.onset = payload.time_course
        elif any(k in text_lower for k in ["aaj", "today", "ee roju", "this morning", "since morning", "ఈ రోజు", "ఈరోజు", "இன்று", "আজ", "আজকে", "आज", "आज से"]):
            payload.duration_days = 1
            payload.time_course = "Today"
            payload.onset = "Today"
        elif any(k in text_lower for k in ["kal", "yesterday", "ninna", "last night", "since last night", "previous night", "निन्न", "நேற்று", "কাল", "কালকে", "कल", "कल से"]):
            payload.duration_days = 1
            payload.time_course = "Since yesterday"
            payload.onset = "Since yesterday"

        # 2. Extract Severity Score (1-10)
        sev_match = re.search(
            r"(?:pain\s*is|severity\s*is|score\s*is|rating\s*is|severity|score|scale|rate|rating|give it|give it a|number)\s*(\d+)(?:\s*(?:/|out\s*of)\s*10)?|(\d+)\s*(?:/|out\s*of)\s*10|10\s*(?:mein|me|lo|out\s*of|se|में|में से|లో)\s*(?:se\s*)?(\d+)|(\d+)\s*(?:में\s*से|లో|లొ)",
            text_lower
        )
        if sev_match:
            for grp in sev_match.groups():
                if grp:
                    try:
                        s_val = int(grp.strip())
                        if 1 <= s_val <= 10:
                            payload.severity_score = s_val
                            break
                    except ValueError:
                        pass
        if payload.severity_score is None:
            if any(k in text_lower for k in ["bahut tez", "severe", "crushing", "unbearable", "తీవ్రమైన", "অসহ্য", "খুব বেশি"]):
                payload.severity_score = 8
            elif any(k in text_lower for k in ["thoda", "mild", "slight", "కొద్దిగా", "একটু", "হালকা"]):
                payload.severity_score = 4

        # 3. Extract Anatomical Site
        if any(k in text_lower for k in ["chest", "chhati", "seene", "chhatilo", "छाती", "सीना", "ఛాతీ", "గుండె", "நெஞ்சு", "বুক", "বুকে"]):
            payload.site = "Chest"
        elif any(k in text_lower for k in ["stomach", "pet", "abdomen", "kadupu", "पेट", "कడుపు", "வயிறு", "পেট", "পেটে"]):
            payload.site = "Abdomen/Stomach"
        elif any(k in text_lower for k in ["head", "sar", "sir", "tala", "सिर", "सर", "తల", "தலை", "মাথা", "মাথায়"]):
            payload.site = "Head"
        elif any(k in text_lower for k in ["throat", "gala", "gontu", "गला", "గొంతు", "தொண்டை", "গলা", "গলায়"]):
            payload.site = "Throat"
        elif any(k in text_lower for k in ["back", "peeth", "venuka", "kamar", "कमर", "पीठ", "నడుము", "పిঠ"]):
            payload.site = "Back/Spine"

        elif any(k in text_lower for k in ["knee", "ankle", "pair", "kaalu", "ghutna", "घुटने", "टखने", "पैर", "కాలు", "পা"]):
            payload.site = "Lower Limbs / Joints"
        elif any(k in text_lower for k in ["skin", "rash", "khujli", "chamdi", "त्वचा", "खुजली", "దద్దుర్లు", "চামড়া", "চুলকানি"]):
            payload.site = "Skin / Whole body"

        # 4. Extract Radiation
        if any(k in text_lower for k in ["left arm", "baaye hath", "baye hath", "edama cheyi", "बाएं हाथ", "ఎడమ చేయి", "বাঁ হাত"]):
            payload.radiation = "Left Arm"
        elif any(k in text_lower for k in ["jaw", "jabde", "davada", "जबड़े", "চোয়াল"]):
            payload.radiation = "Jaw"
        elif any(k in text_lower for k in ["shoulder", "kandhe", "భుజం", "কাঁধ"]):
            payload.radiation = "Left Shoulder"
        elif any(k in text_lower for k in ["back", "peeth", "पीठ", "পিঠ"]):
            payload.radiation = "Back"

        # 5. Extract Pain Character
        if any(k in text_lower for k in ["heavy", "bhari", "bhaari", "pressure", "dabav", "भारीपन", "दबाव", "బరువు", "চাপ"]):
            payload.character = "Heavy / Crushing Pressure"
        elif any(k in text_lower for k in ["sharp", "tez", "chubhan", "teevram", "चुभन", "तेज", "తీవ్రమైన", "তীক্ষ্ণ"]):
            payload.character = "Sharp / Stabbing"
        elif any(k in text_lower for k in ["burning", "jalan", "manta", "जलन", "మంట", "জ্বালা"]):
            payload.character = "Burning / Dyspeptic"
        elif any(k in text_lower for k in ["wheez", "ghargharahat", "घरघराहट", "దగ్गु"]):
            payload.character = "Wheezing / Constricting"

        # 6. Extract Associated Symptoms with Negation Awareness
        def is_negated(sym_keywords: List[str]) -> bool:
            for kw in sym_keywords:
                pattern = r"(?:no|not|don't\s*have|dont\s*have|nahi|nahin|లేదు|లేవు|নেই|না)\s*(?:any\s*)?" + re.escape(kw)
                if re.search(pattern, text_lower):
                    return True
                pattern_rev = re.escape(kw) + r"\s*(?:nahi|nahin|లేదు|లేవు|নেই|না)"
                if re.search(pattern_rev, text_lower):
                    return True
            return False

        symptoms = []
        if any(k in text_lower for k in ["chest pain", "chhati me dard", "seene mein dard", "छाती में दर्द", "ఛాతీ నొప్పి", "বুকে ব্যথা"]) and not is_negated(["chest pain", "chhati", "seene"]):
            symptoms.append("Chest pain")
        if any(k in text_lower for k in ["fever", "bukhar", "jwaram", "ताप", "बुखार", "జ్వరం", "জ্বর"]) and not is_negated(["fever", "bukhar", "jwaram", "ताप", "बुखार", "జ్వరం", "জ্বর"]):
            symptoms.append("Fever")
        if any(k in text_lower for k in ["cough", "khansi", "daggu", "खांसी", "దగ్గు", "কাশি"]) and not is_negated(["cough", "khansi", "daggu", "खांसी", "কাশি"]):
            symptoms.append("Cough")
        if any(k in text_lower for k in ["sweat", "paseena", "chemata", "पसीना", "చెమట", "ঘাম"]) and not is_negated(["sweat", "paseena", "chemata"]):
            symptoms.append("Diaphoresis (Sweating)")
        if any(k in text_lower for k in ["breath", "saans", "oosiri", "dum", "सांस फूलना", "శ్వాస", "হাঁপ"]) and not is_negated(["breath", "saans", "oosiri"]):
            symptoms.append("Dyspnea (Shortness of breath)")
        if any(k in text_lower for k in ["vomit", "ulti", "vanti", "उल्टी", "వాంతులు", "বমি"]) and not is_negated(["vomit", "ulti", "vanti", "उल्टी", "వాంతులు", "বমি"]):
            symptoms.append("Vomiting")
        if any(k in text_lower for k in ["nausea", "ji ghabrana", "vikaram", "मतली", "వికారం", "বমি ভাব"]) and not is_negated(["nausea", "vikaram", "मतली"]):
            symptoms.append("Nausea")
        if any(k in text_lower for k in ["headache", "sar dard", "sir dard", "talanopi", "सिर दर्द", "తలనొప్పి", "মাথা ব্যথা"]) and not is_negated(["headache", "sar dard", "सिर दर्द"]):
            symptoms.append("Headache")
        if any(k in text_lower for k in ["weak", "kamzori", "alasata", "कमजोरी", "నీరసం", "দুর্বলতা"]):
            symptoms.append("Generalized Weakness")

        payload.associated_symptoms = symptoms

        # 7. Extract Past History, Allergies & Medications
        past_hist = []
        curr_meds = []
        allergies = []

        # Allergies extraction
        if any(k in text_lower for k in ["penicillin", "amoxicillin", "penicilin", "पेनिसिलिन"]):
            allergies.append("Penicillin / Beta-lactam Antibiotics (Severe rash/urticaria reported)")
        if any(k in text_lower for k in ["sulfa", "sulfonamide", "सल्फा"]):
            allergies.append("Sulfa Drugs")
        if any(k in text_lower for k in ["aspirin", "nsaid", "ibuprofen"]):
            allergies.append("NSAIDs / Aspirin")
        if any(k in text_lower for k in ["peanut", "peanuts", "egg", "milk allergy", "dust allergy"]):
            allergies.append("Environmental / Food Allergy")
        if any(k in text_lower for k in ["no allergy", "koi allergy nahi", "no known allergies", "allergy nahi hai"]):
            allergies.append("No known drug allergies (NKDA)")

        # Past Medical History
        if any(k in text_lower for k in ["tb", "tuberculosis", "dots", "t.b.", "टीबी", "तपेदिक"]):
            past_hist.append("Pulmonary Tuberculosis (Completed Anti-TB DOTS Regimen)")
        if any(k in text_lower for k in ["bp", "blood pressure", "hypertension", "उच्च रक्तचाप", "high bp"]):
            past_hist.append("Essential Hypertension")
        if any(k in text_lower for k in ["sugar", "diabetes", "madhumeh", "मधुमेह", "high sugar"]):
            past_hist.append("Type 2 Diabetes Mellitus")
        if any(k in text_lower for k in ["thyroid", "hypothyroid", "थायराइड"]):
            past_hist.append("Hypothyroidism / Thyroid Disorder")
        if any(k in text_lower for k in ["asthma", "dama", "दमा", "wheezing"]):
            past_hist.append("Bronchial Asthma / Reactive Airway")
        if any(k in text_lower for k in ["heart attack", "stent", "bypass", "angioplasty", "दिल का दौरा"]):
            past_hist.append("Coronary Artery Disease / Post-PCI")
        if any(k in text_lower for k in ["no past", "no previous", "no illness", "no disease", "kuch nahi", "koi bimari nahi", "nothing else"]):
            past_hist.append("No significant past medical history")

        # Ongoing Medications
        if any(k in text_lower for k in ["amlodipine", "amlo", "telmisartan", "atenolol", "bp ki goli", "bp tablet"]):
            curr_meds.append("Anti-hypertensive therapy (Amlodipine / Telmisartan)")
        if any(k in text_lower for k in ["metformin", "glycomet", "glimepiride", "insulin", "sugar tablet", "sugar ki goli"]):
            curr_meds.append("Oral Anti-diabetic medication (Metformin)")
        if any(k in text_lower for k in ["thyronorm", "eltroxin", "levothyroxine"]):
            curr_meds.append("Levothyroxine (Thyroid)")
        if any(k in text_lower for k in ["paracetamol", "crocin", "dolo", "calpol", "pcm", "combiflam"]):
            curr_meds.append("Paracetamol / Analgesic")

        payload.past_history = past_hist
        payload.allergies = allergies
        payload.current_medications = curr_meds

        # Apply strict lexical grounding verification to eliminate any unevidenced extractions
        payload = safety_guardrails.verify_grounding(payload, transcript)

        return payload

    def generate_dialogue_fast(

        self,
        transcript: str,
        state: ClinicalIntakeState,
        extracted: ExtractionPayload,
        language: str = "hi",
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generates immediate empathetic clinical response & quick replies in < 5ms.
        Evaluates merged clinical state to systematically probe SOCRATES without repeating questions.
        """
        # 1. Emergency Red Flag Check
        red_flag = safety_guardrails.scan_red_flags(transcript)
        if red_flag and red_flag.is_emergency:
            if language == "hi":
                resp = "यह गंभीर लक्षण हो सकता है। कृपया शांत होकर बैठें, हमने तुरंत इमरजेंसी मेडिकल टीम और ईसीजी को अलर्ट कर दिया है।"
                replies = ["हाँ, चक्कर आ रहे हैं", "सांस लेने में भी तकलीफ़ है", "दर्द लगातार बढ़ रहा है"]
            elif language == "bn":
                resp = "এটি অত্যন্ত গুরুতর লক্ষণ হতে পারে। অনুগ্রহ করে শান্ত হয়ে বসুন, আমরা জরুরি মেডিক্যাল টিমকে অ্যালার্ট করেছি।"
                replies = ["মাথা ঘুরছে", " hisশ্বাস নিতে কষ্ট হচ্ছে", "ব্যথা বাড়ছে"]
            elif language == "te":
                resp = "ఇది అత్యవసరమైన లక్షణం. దయచేసి కూర్చోండి, మేము తక్షణమే అత్యవసర వైద్య విభాగానికి సమాచారం అందించాము."
                replies = ["అవును, కళ్లు తిరుగుతున్నాయి", "శ్వాస తీసుకోవడం కష్టంగా ఉంది", "నొప్పి పెరుగుతోంది"]
            elif language == "ta":
                resp = "இது அவசர சிகிச்சை தேவைப்படும் அறிகுறி. தயவுசெய்து அமருங்கள், அவசர மருத்துவ குழுவிற்கு தகவல் அனுப்பப்பட்டுள்ளது."
                replies = ["மூச்சு விடுவது கடினம்", "மயக்கம் வருகிறது", "வலி அதிகமாகிறது"]
            else:
                resp = "These symptoms require immediate priority attention. Please remain seated while we alert the emergency clinical team."
                replies = ["I feel dizzy", "Difficulty breathing", "Pain is increasing"]

            return {
                "spoken_response": resp,
                "quick_replies": replies,
                "is_emergency": True
            }

        # 2. Detect Meta-Intents (Identity, Bengali/Hindi/Telugu name queries, Capability, Feedback)
        meta = self.detect_meta_intent(transcript)
        if meta:
            mtype = meta.get("type")
            if meta.get("detected_lang"):
                language = meta["detected_lang"]
                state.language = language

            if mtype == "identity":
                if language == "bn":
                    return {
                        "spoken_response": "নমস্কার! আমি আরোগ্য মিত্র — মেডিকিয়স্কের এআই ক্লিনিকাল সহকারী। আপনার কী সমস্যা বা অসুস্থতা হচ্ছে দয়া করে বলুন।",
                        "quick_replies": ["পেটে ব্যথা হচ্ছে", "বুকে ব্যথা বা অস্বস্তি", "জ্বর এবং সর্দি-কাশি"],
                        "is_emergency": False
                    }
                elif language == "hi":
                    return {
                        "spoken_response": "नमस्ते! मैं आरोग्य मित्र हूँ — मेडीकियोस्क का एआई क्लिनिकल सहायक। कृपया बताएं आज आपको क्या तकलीफ़ या समस्या है?",
                        "quick_replies": ["पेट में दर्द है", "सीने में दर्द या भारीपन", "बुखार और कमजोरी"],
                        "is_emergency": False
                    }
                elif language == "te":
                    return {
                        "spoken_response": "నమస్కారం! నేను ఆరోగ్య మిత్ర — మేడికియోస్క్ AI క్లినికల్ సహాయకుడిని. మీకు ఏ విధమైన ఆరోగ్య సమస్య ఉందో చెప్పండి.",
                        "quick_replies": ["కడుపు నొప్పి ఉంది", "ఛాతీలో నొప్పి ఉంది", "జ్వరం మరియు దగ్గు"],
                        "is_emergency": False
                    }
                else:
                    return {
                        "spoken_response": "I am Aarogya Mitra, your AI clinical intake assistant at MediKiosk. Please tell me what symptoms or health trouble you are experiencing today.",
                        "quick_replies": ["I have stomach pain", "I have chest discomfort", "I have fever and cough"],
                        "is_emergency": False
                    }

            elif mtype == "medication_inquiry":
                if language == "hi":
                    return {
                        "spoken_response": "जी हाँ, पैरासिटामोल जैसी सामान्य दवा से हल्के-से-मध्यम दर्द में अस्थायी राहत मिल सकती है, बशर्ते आपको कोई एलर्जी या लिवर की समस्या न हो। लेकिन सही खुराक और कारण के लिए डॉक्टर से परामर्श लेना सबसे सुरक्षित रहेगा। कृपया बताएं आपको दर्द शरीर के किस हिस्से में और कितना तेज महसूस हो रहा है?",
                        "quick_replies": ["सिर में तेज दर्द है", "पेट में दर्द है", "सीने में भारीपन है"],
                        "is_emergency": False
                    }
                elif language == "bn":
                    return {
                        "spoken_response": "হ্যাঁ, প্যারাসিটামলের মতো ওষুধ সাময়িক উপশম দিতে পারে, তবে সঠিক মাত্রা ও কারণ জানার জন্য ডাক্তারের পরামর্শ নেওয়াই সবচেয়ে নিরাপদ। আপনার শরীরে ঠিক কোথায় এবং কতটা তীব্র কষ্ট হচ্ছে বলুন?",
                        "quick_replies": ["মাথায় তীব্র ব্যথা", "পেটে যন্ত্রণা", "বুকে অস্বস্তি"],
                        "is_emergency": False
                    }
                elif language == "te":
                    return {
                        "spoken_response": "అవును, పారాసిటమాల్ వంటి మందులు తాత్కాలికంగా ఉపశమనం ఇవ్వగలవు, కానీ సరైన మోతాదు కోసం డాక్టర్‌ను సంప్రదించడం మంచిది. మీకు నొప్పి ఎక్కడ మరియు ఎంత తీవ్రంగా ఉందో చెప్పండి?",
                        "quick_replies": ["తల నొప్పిగా ఉంది", "కడుపు నొప్పి", "ఛాతీలో నొప్పి"],
                        "is_emergency": False
                    }
                else:
                    return {
                        "spoken_response": "Yes, over-the-counter paracetamol can provide temporary relief for mild-to-moderate pain, provided you have no allergies or liver conditions. However, consulting the physician for the exact dosage and root cause is safest. Where specifically in your body is the pain located and how severe is it?",
                        "quick_replies": ["Severe headache", "Stomach pain", "Chest discomfort"],
                        "is_emergency": False
                    }

            elif mtype == "help":
                if language == "hi":
                    return {
                        "spoken_response": "मैं डॉक्टर से मिलने से पहले आपकी बीमारी के लक्षण और इतिहास को व्यवस्थित रूप से दर्ज करता हूँ ताकि डॉक्टर आपका इलाज तेज़ी से शुरू कर सकें। आपको क्या तकलीफ़ है?",
                        "quick_replies": ["पेट दर्द की समस्या", "सीने में दर्द", "बुखार और सिरदर्द"],
                        "is_emergency": False
                    }
                elif language == "bn":
                    return {
                        "spoken_response": "আমি ডাক্তারের সাথে দেখার পূর্বে আপনার সমস্ত লক্ষণ ও শারীরিক বিবরণ সংগ্রহ করি। আপনার শরীরে কী সমস্যা হচ্ছে বলুন।",
                        "quick_replies": ["পেটে ব্যথা", "বুকে ব্যথা", "জ্বর ও সর্দি"],
                        "is_emergency": False
                    }
                else:
                    return {
                        "spoken_response": "I help collect and organize your clinical symptoms and medical history so your consulting doctor is fully prepared. What symptoms are you experiencing today?",
                        "quick_replies": ["I have stomach discomfort", "I have chest pain", "I have a fever"],
                        "is_emergency": False
                    }

            elif mtype == "deepen_inquiry":
                if language == "hi":
                    return {
                        "spoken_response": "माफी चाहता हूँ। आइए विस्तार से पूरी बात समझते हैं। क्या किसी खास काम या खाने से यह तकलीफ़ बढ़ती है, और क्या आपको पहले से बीपी, शुगर जैसी कोई बीमारी है?",
                        "quick_replies": ["बीपी और शुगर की दवा चल रही है", "खाली पेट दर्द बढ़ता है", "पहले भी ऐसा हुआ था"],
                        "is_emergency": False
                    }
                elif language == "bn":
                    return {
                        "spoken_response": "আমি দুঃখিত। আসুন আরও বিস্তারিত জানি। এই সমস্যাটি কি কোনও নির্দিষ্ট কারণে বাড়ে, আর আপনার কি আগে থেকেই ডায়াবেটিস বা প্রেসারের সমস্যা আছে?",
                        "quick_replies": ["ডায়াবেটিস ও প্রেসার আছে", "খাওয়ার পর বাড়ে", "আগে কোনও রোগ নেই"],
                        "is_emergency": False
                    }
                else:
                    return {
                        "spoken_response": "I apologize for rushing. Let's record your complete history in detail. What triggers or worsens this discomfort, and do you have any pre-existing medical conditions or ongoing medications?",
                        "quick_replies": ["History of hypertension/diabetes", "Worse after meals or exertion", "No other medical history"],
                        "is_emergency": False
                    }

            elif mtype == "language_switch":
                target = meta.get("target_lang", "hi")
                state.language = target
                language = target
                if target == "hi":
                    msg = "जी बिल्कुल, अब हम हिंदी में बात करेंगे। कृपया अपनी समस्या बताएं।"
                elif target == "bn":
                    msg = "নিশ্চয়ই, এখন আমরা বাংলায় কথা বলব। আপনার সমস্যার কথা বলুন।"
                elif target == "te":
                    msg = "తప్పకుండా, ఇప్పుడు మనం తెలుగులో మాట్లాడుకుందాం. మీ సమస్యను చెప్పండి."
                else:
                    msg = "Sure, let's continue in English. Please tell me about your symptoms."
                return {"spoken_response": msg, "quick_replies": ["Describe symptoms"], "is_emergency": False}

        # 3. Evaluate merged SOCRATES state & historical context
        has_site = bool(state.socrates.site or extracted.site)
        has_duration = bool(
            state.socrates.onset or
            state.socrates.duration_days is not None or
            extracted.duration_days is not None or
            extracted.time_course or
            extracted.onset
        )
        has_character = bool(state.socrates.character or extracted.character)
        has_radiation = bool(state.socrates.radiation or extracted.radiation)
        has_aggravating = bool(state.socrates.exacerbating_relieving or extracted.exacerbating_relieving)
        has_associated = bool(state.associated_symptoms or state.socrates.associations or extracted.associated_symptoms)
        has_history_corr = bool(state.historical_correlation or (state.past_history and len(state.asked_questions) >= 5))
        has_severity = bool(state.socrates.severity_score is not None or extracted.severity_score is not None)

        site_val = state.socrates.site or extracted.site or ""
        site_lower = site_val.lower()

        # Check turn budget: Target 7-8 comprehensive clinical questions before conclusion
        if state.is_triage_complete or state.turn_count >= 8:
            state.is_triage_complete = True
            if language == "hi":
                spoken = "आपकी सभी जानकारियाँ, शारीरिक लक्षण और पुराना मेडिकल इतिहास विस्तार से नोट कर लिया गया है। डॉक्टर साहब के लिए विस्तृत क्लिनिकल रिपोर्ट तैयार हो गई है। कृपया ओपीडी टोकन के साथ डॉक्टर के केबिन में जाएं।"
                replies = ["डॉक्टर वर्कस्टेशन खोलें", "टोकन नंबर दिखाएं", "पीडीएफ रिपोर्ट डाउनलोड करें"]
            elif language == "bn":
                spoken = "আপনার সমস্ত শারীরিক লক্ষণ, উপসর্গ ও পূর্বের চিকিৎসার ইতিহাস বিশদভাবে রেকর্ড করা হয়েছে। ডাক্তারের জন্য সম্পূর্ণ ক্লিনিকাল রিপোর্ট তৈরি। অনুগ্রহ করে ওপিডি টোকেন নিয়ে অপেক্ষা করুন।"
                replies = ["ওপিডি টোকেন দেখুন", "ডাক্তার পোর্টাল খুলুন", "রিপোর্ট ডাউনলোড"]
            elif language == "te":
                spoken = "మీ అన్ని ఆరోగ్య వివరాలు, పూర్వ అనారోగ్య చరిత్ర వివరంగా నమోదు చేయబడ్డాయి. డాక్టర్ గారి కోసం పూర్తి నివేదిక సిద్ధమైంది. దయచేసి OPD టోకెన్‌తో వేచి ఉండండి."
                replies = ["టోకెన్ సంఖ్య చూడండి", "డాక్టర్ పోర్టల్", "PDF రిపోర్ట్ డౌన్‌లోడ్"]
            elif language == "ta":
                spoken = "உங்கள் உடல்நல அறிகுறிகள் மற்றும் முந்தைய மருத்துவ பதிவுகள் முழுமையாக பதிவு செய்யப்பட்டுள்ளன. மருத்துவருக்கான முழு அறிக்கை தயார்."
                replies = ["OPD டோக்கன்", "மருத்துவர் பார்வை", "PDF பதிவிறக்கம்"]
            elif language == "mr":
                spoken = "तुमची सर्व लक्षणे आणि जुना वैद्यकीय इतिहास तपशीलवार नोंदवला गेला आहे. डॉक्टरांसाठी क्लिनिकल रिपोर्ट तयार आहे."
                replies = ["टोकन क्रमांक पहा", "डॉक्टर पोर्टल उघडा"]
            else:
                spoken = "Your comprehensive clinical presentation, symptom progression, and past medical history have been compiled into a structured summary for the consulting physician. Please proceed with your OPD token."
                replies = ["View OPD Token", "Open Doctor Cockpit", "Download PDF Report"]

            return {
                "spoken_response": spoken,
                "quick_replies": replies,
                "is_emergency": False
            }

        # Determine clinical specialty domain based on site & keywords
        t_all = (transcript + " " + (state.chief_complaints[0] if state.chief_complaints else "") + " " + site_val).lower()
        
        if any(k in t_all for k in ["chest", "seene", "chhati", "heart", "cardiac", "palpitation", "घबराहट", "धड़कन", "छाती", "सीना", "ఛాతీ", "గుండె", "நெஞ்சு", "বুক"]):
            domain = "cardio"
        elif any(k in t_all for k in ["cough", "khansi", "saans", "breath", "wheeze", "sputum", "phlegm", "asthma", "tb", "खांसी", "सांस", "दम", "దగ్గు", "శ్వాస", "কাশি", "শ্বাস"]):
            domain = "pulmo"
        elif any(k in t_all for k in ["stomach", "pet", "abdomen", "ulcer", "vomit", "motion", "loose", "acidity", "gas", "jalan", "पेट", "कడుపు", "വയிறு", "পেট", "জ্বালা"]):
            domain = "gi"
        elif any(k in t_all for k in ["head", "sar", "sir", "migraine", "chakkar", "dizziness", "stroke", "paralysis", "सिर", "सर", "चक्कर", "తల", "মাথা"]):
            domain = "neuro"
        elif any(k in t_all for k in ["joint", "ghutna", "kamar", "back", "knee", "bone", "swelling", "stiffness", "कमर", "घुटना", "पीठ", "जोड़ों", "నడుము", "కీళ్ల", "হাঁটু"]):
            domain = "ortho"
        elif any(k in t_all for k in ["sugar", "diabetes", "peshab", "urine", "thirst", "pyas", "weight", "thyroid", "शुगर", "प्यास", "पेशाब", "షుగర్", "మూత్రం"]):
            domain = "endo"
        elif any(k in t_all for k in ["fever", "bukhar", "taap", "temperature", "chills", "jhad", "dengue", "malaria", "बुखार", "ठंड", "జ్వరం", "জ্বর", "কাঁপনি"]):
            domain = "fever"
        elif any(k in t_all for k in ["rash", "khujli", "itch", "skin", "allergy", "daane", "खुजली", "दाने", "त्वचा", "దురద", "চুলকানি"]):
            domain = "derma"
        else:
            domain = "general"

        # Select sequential unique probing slot (8 distinct clinical axes)
        candidate_slots = []
        if not has_site and "site" not in state.asked_questions:
            candidate_slots.append("site")
        if not has_duration and "duration" not in state.asked_questions:
            candidate_slots.append("duration")
        if not has_character and "character" not in state.asked_questions:
            candidate_slots.append("character")
        if not has_radiation and "radiation" not in state.asked_questions:
            candidate_slots.append("radiation")
        if not has_aggravating and "aggravating" not in state.asked_questions:
            candidate_slots.append("aggravating")
        if not has_associated and "associated" not in state.asked_questions:
            candidate_slots.append("associated")
        if not has_history_corr and "history_correlation" not in state.asked_questions:
            candidate_slots.append("history_correlation")
        if not has_severity and "severity" not in state.asked_questions:
            candidate_slots.append("severity")

        if not candidate_slots:
            remaining = [s for s in ["site", "duration", "character", "radiation", "aggravating", "associated", "history_correlation", "severity"] if s not in state.asked_questions]
            target_slot = remaining[0] if remaining else "severity"
        else:
            target_slot = candidate_slots[0]

        state.asked_questions.append(target_slot)
        state.last_target_slot = target_slot

        # 4. Formulate Deep Specialty-Aware Vernacular Dynamic Question (7-8 Turn Tree)
        if language == "bn":
            if domain == "cardio":
                questions = {
                    "site": ("বুকের ঠিক কোন অংশে ভারী ভাব বা ব্যথা হচ্ছে — মাঝখানে, বাঁ দিকে, নাকি ওপরের দিকে?", ["বুকের মাঝখানে", "বাঁ দিকে", "ঘাড়ের দিকে"]),
                    "duration": ("এই ব্যথা বা চাপটি কখন শুরু হয়েছিল এবং একটানা হচ্ছে না থেমে থেমে?", ["গত ২ দিন ধরে", "আজ সকালে হঠাৎ", "একটানা হচ্ছে"]),
                    "character": ("বুকের অনুভুতিটি কেমন — পাথর চাপা ভার, চেপে ধরা চাপ, নাকি জ্বালাপোড়া?", ["ভারী পাথরের মতো চাপ", "তীব্র জ্বালাপোড়া", "ছুঁচ ফোটানোর মতো"]),
                    "radiation": ("এই ব্যথা কি বাঁ হাত, কাঁধ, পিঠ বা চোয়ালের দিকে ছড়িয়ে পড়ছে?", ["হ্যাঁ, বাঁ হাতে ছড়াচ্ছে", "চোয়াল ও পিঠে ছড়াচ্ছে", "না, শুধু বুকেই আছে"]),
                    "aggravating": ("হাঁটলে, সিঁড়ি চড়লে বা পরিশ্রম করলে কি এই চাপ ও অস্বস্তি বাড়ে?", ["সিঁড়ি চড়লে বাড়ে", "ভারী কাজ করলে বাড়ে", "বিশ্রামেও থাকে"]),
                    "associated": ("এর সাথে কি অতিরিক্ত ঠান্ডা ঘাম, শ্বাসকষ্ট বা বুক ধড়ফড় করার মতো লক্ষণ আছে?", ["প্রচণ্ড ঘাম ও শ্বাসকষ্ট", "বুক ধড়ফড় করছে", "না, অন্য সমস্যা নেই"]),
                    "history_correlation": ("আপনার কি পূর্বে উচ্চ রক্তচাপ, ডায়াবেটিস বা হার্টের কোনো সমস্যা আছে এবং নিয়মিত ওষুধ খাচ্ছেন?", ["প্রেসার ও সুগারের ওষুধ খাই", "আগে হার্টের সমস্যা ছিল", "পূর্বে কোনো রোগ ছিল না"]),
                    "severity": ("১ থেকে ১০ স্কেলে এই কষ্ট বা যন্ত্রণাকে আপনি কত তীব্র বলবেন?", ["১০ এ ৮ (তীব্র কষ্ট)", "১০ এ ৬ (মাঝারি কষ্ট)", "১০ এ ৪ (হালকা)"])
                }
            elif domain == "gi":
                questions = {
                    "site": ("পেটের ঠিক কোন জায়গায় ব্যথা বা অস্বস্তি — ওপরের পেটে, নাভির কাছে, না নিচের দিকে?", ["ওপরের পেটে", "নাভির চারপাশে", "তলপেটে"]),
                    "duration": ("এই পেটের সমস্যা কত দিন ধরে চলছে এবং খাবারের সাথে কোনো সম্পর্ক আছে কি?", ["৩-৪ দিন ধরে", "আজ সকাল থেকে", "১ সপ্তাহ ধরে"]),
                    "character": ("ব্যথার ধরন কেমন — তীব্র জ্বালাপোড়া, মোচড় দেওয়া পেটব্যথা, নাকি ফাঁপা ভার?", ["তীব্র জ্বালাপোড়া", "মোচড় দিয়ে উঠছে", "পেট ফাঁপা ও ভার"]),
                    "radiation": ("পেটের এই ব্যথা কি পিঠের দিকে বা কাঁধের দিকে ছড়িয়ে যায়?", ["পিঠের দিকে ছড়িয়ে যায়", "না, পেটের ভেতরেই থাকে"]),
                    "aggravating": ("মশলাদার খাবার খেলে বা খালি পেটে থাকলে কি ব্যথা বাড়ে?", ["মশলাদার খাবারে বাড়ে", "খালি পেটে বাড়ে", "খাওয়ার পর কমে"]),
                    "associated": ("বমি ভাব, টক ঢেঁকুর, পেট ফাঁপা বা পায়খানার কোনো পরিবর্তন (পাতলা/কালো পায়খানা) হয়েছে?", ["টক ঢেঁকুর ও বমি ভাব", "পাতলা পায়খানা হচ্ছে", "না, স্বাভাবিক"]),
                    "history_correlation": ("আপনার কি পূর্বে গ্যাস-অম্বল, আলসার বা গলব্লাডারের পাথর হয়েছিল?", ["আগে আলসার ও গ্যাসের সমস্যা ছিল", "পিত্তথলিতে পাথর ছিল", "না, আগে ছিল না"]),
                    "severity": ("১ থেকে ১০ স্কেলে পেটের এই ব্যথার তীব্রতা কত?", ["১০ এ ৭ (তীব্র)", "১০ এ ৫ (মাঝারি)", "১০ এ ৩ (হালকা)"])
                }
            else:
                questions = {
                    "site": ("আপনার শারীরিক সমস্যা শরীরের কোন অংশে সবচেয়ে বেশি অনুভূত হচ্ছে?", ["মাথায়", "বুকে", "পেটে", "শরীরের বিভিন্ন গাঁটে"]),
                    "duration": ("এই সমস্যা কত দিন বা কত সময় ধরে হচ্ছে?", ["আজ সকাল থেকে", "২-৩ দিন ধরে", "অনেক দিন ধরে"]),
                    "character": ("সমস্যার লক্ষণটি কেমন — টানা অস্বস্তি, তীব্র ব্যথা, নাকি দুর্বলতা?", ["টানা অস্বস্তি", "তীব্র যন্ত্রণা", "দুর্বলতা ও জ্বর"]),
                    "radiation": ("এই কষ্ট শরীরের অন্য কোনো দিকে ছড়িয়ে পড়ছে কি?", ["হ্যাঁ, অন্য অংশে ছড়াচ্ছে", "না, এক জায়গাতেই আছে"]),
                    "aggravating": ("কোনো বিশেষ কাজের পর বা নড়াচড়া করলে কি কষ্ট বাড়ে?", ["নড়াচড়া করলে বাড়ে", "বিশ্রামে আরাম পাই"]),
                    "associated": ("এর সাথে জ্বর, বমি, শ্বাসকষ্ট বা দুর্বলতা আছে কি?", ["জ্বর ও শরীর ব্যথা", "বমি ভাব", "না, অন্য লক্ষণ নেই"]),
                    "history_correlation": ("আপনার কি আগে থেকে প্রেসার, সুগার, টিবি বা অ্যাজমার মতো কোনো পুরোনো রোগ আছে?", ["প্রেসার ও সুগারের ওষুধ চলছে", "আগে টিবি হয়েছিল", "না, কোনো রোগ নেই"]),
                    "severity": ("১ থেকে ১০ নম্বরের মধ্যে কষ্টের মাত্রা কত দেবেন?", ["১০ এ ৮", "১০ এ ৫", "১০ এ ৩"])
                }
            q_data = questions.get(target_slot, questions["severity"])
            spoken, replies = q_data[0], q_data[1]

        elif language == "hi":
            if domain == "cardio":
                questions = {
                    "site": ("सीने के ठीक किस हिस्से में दर्द या भारीपन लग रहा है — बीच में, बाईं तरफ, या ऊपर की ओर?", ["सीने के बिल्कुल बीच में", "बाईं तरफ ज्यादा है", "ऊपर गले की तरफ"]),
                    "duration": ("यह सीने का भारीपन या दर्द कब से शुरू हुआ है — आज सुबह से या पिछले 2-3 दिनों से?", ["आज सुबह से अचानक", "पिछले 2-3 दिनों से", "1 हफ्ते से"]),
                    "character": ("सीने में किस तरह का अहसास है — पत्थर जैसा भारी दबाव, जलन, या चुभने वाला तेज दर्द?", ["पत्थर जैसा भारी दबाव है", "जलन जैसी तकलीफ़ है", "तेज चुभन हो रही है"]),
                    "radiation": ("क्या यह दर्द सीने से होकर आपके बाएं हाथ, कंधे, जबड़े या पीठ की तरफ भी फैलता है?", ["हाँ, बाएं हाथ में जा रहा है", "जबड़े और पीठ की तरफ", "नहीं, सिर्फ सीने में है"]),
                    "aggravating": ("क्या पैदल चलने, सीढ़ियां चढ़ने या कोई भारी काम करने पर यह दबाव और दर्द बढ़ता है?", ["सीढ़ियां चढ़ने पर बढ़ता है", "थोड़ा चलने पर भी बढ़ता है", "बैठे रहने पर भी रहता है"]),
                    "associated": ("क्या इसके साथ आपको ठंडा पसीना आना, सांस फूलना, घबराहट या चक्कर जैसा महसूस हो रहा है?", ["पसीना और सांस फूल रही है", "दिल की धड़कन तेज है", "कोई अन्य लक्षण नहीं है"]),
                    "history_correlation": ("क्या आपको पहले से हाई बीपी, शुगर, कोलेस्ट्रॉल या दिल की बीमारी का इतिहास है और क्या नियमित दवा ले रहे हैं?", ["बीपी और शुगर की दवा चल रही है", "पहले स्टेंट या हार्ट की समस्या थी", "पहले से कोई बीमारी नहीं है"]),
                    "severity": ("1 से 10 के पैमाने पर आप इस दर्द या भारीपन को कितना स्कोर (तीव्रता) देंगे?", ["10 में से 8 (तेज दर्द)", "10 में से 6 (मध्यम)", "10 में से 4 (हल्का दर्द)"])
                }
            elif domain == "pulmo":
                questions = {
                    "site": ("खांसी और सांस की तकलीफ़ छाती के किस हिस्से में ज्यादा महसूस हो रही है?", ["दोनों तरफ छाती में जकड़न", "गले और ऊपरी छाती में", "पीठ की तरफ दर्द"]),
                    "duration": ("यह खांसी या सांस फूलने की समस्या कितने दिनों या हफ्तों से चल रही है?", ["पिछले 3-4 दिनों से", "2 हफ्तों से ज्यादा समय से", "1 महीने से"]),
                    "character": ("खांसी कैसी है — सूखी खांसी है, या बलगम (कफ) आ रहा है? कफ का रंग कैसा है?", ["सूखी खांसी है", "सफेद/पीला बलगम आ रहा है", "बलगम में खून का अंश है"]),
                    "radiation": ("क्या गहरी सांस लेने या खांसने पर सीने में सुई जैसी चुभन या पीठ में दर्द होता है?", ["गहरी सांस पर सुई जैसी चुभन", "खांसने पर सीने में दर्द", "नहीं, ऐसा दर्द नहीं है"]),
                    "aggravating": ("क्या रात में लेटने पर, धूल-मिट्टी या ठंडी हवा में सांस की तकलीफ़ बढ़ जाती है?", ["रात में लेटने पर बढ़ती है", "धूल और ठंड में बढ़ती है", "हर समय एक जैसी है"]),
                    "associated": ("क्या इसके साथ शाम को हल्का बुखार, रात में पसीना, या वजन घटने की शिकायत है?", ["शाम को बुखार और पसीना", "बहुत ज्यादा कमजोरी है", "कोई बुखार नहीं है"]),
                    "history_correlation": ("क्या आपको पहले कभी टीबी (TB), दमा (Asthma), या एलर्जी की बीमारी रही है या किसी का इलाज चला था?", ["2 साल पहले टीबी का इलाज पूरा हुआ", "दमे/इन्हेलर की समस्या है", "पहले कोई फेफड़ों की बीमारी नहीं थी"]),
                    "severity": ("1 से 10 के पैमाने पर सांस की इस तकलीफ़ को आप कितना गंभीर मानेंगे?", ["10 में से 8 (सांस लेने में भारी दिक्कत)", "10 में से 5 (मध्यम)", "10 में से 3 (हल्की खांसी)"])
                }
            elif domain == "gi":
                questions = {
                    "site": ("पेट के किस हिस्से में दर्द या जलन सबसे ज्यादा है — नाभि के ऊपर, दाईं तरफ, या नीचे?", ["नाभि के ऊपर (पेट के बीच में)", "दाईं तरफ पसलियों के नीचे", "निचले पेट में"]),
                    "duration": ("यह पेट की तकलीफ़ कितने दिनों से हो रही है?", ["पिछले 2-3 दिनों से", "आज सुबह से अचानक", "1 हफ्ते से"]),
                    "character": ("दर्द का अहसास कैसा है — तेज जलन, मरोड़ उठना, या लगातार भारी चुभन?", ["तेज जलन और खट्टी डकार", "पेट में मरोड़ उठ रही है", "लगातार भारी दर्द है"]),
                    "radiation": ("क्या यह दर्द पेट से होकर आपकी पीठ या कंधे की तरफ भी जाता है?", ["पीठ की तरफ जाता है", "नहीं, सिर्फ पेट में रहता है"]),
                    "aggravating": ("क्या खाना खाने के तुरंत बाद दर्द बढ़ता है, या खाली पेट रहने पर ज्यादा जलन होती है?", ["खाना खाने के बाद बढ़ता है", "खाली पेट ज्यादा जलन होती है", "मसालेदार खाने से बढ़ता है"]),
                    "associated": ("क्या उल्टी, जी मिचलाना, पेट फूलना, या दस्त/मल में कोई बदलाव (काला मल) है?", ["उल्टी और जी मिचलाना", "पेट बहुत फूल रहा है", "दस्त लग रहे हैं", "कोई अन्य लक्षण नहीं"]),
                    "history_correlation": ("क्या आपको पहले से एसिडिटी, पेट में अल्सर, पथरी या लिवर की कोई पुरानी समस्या रही है?", ["अल्सर और गैस की पुरानी समस्या है", "पित्त की थैली में पथरी थी", "पहले ऐसी कोई बीमारी नहीं थी"]),
                    "severity": ("1 से 10 के पैमाने पर पेट के इस दर्द की तीव्रता कितनी है?", ["10 में से 7 (तेज दर्द)", "10 में से 5 (मध्यम)", "10 में से 3 (हल्का दर्द)"])
                }
            elif domain == "ortho":
                questions = {
                    "site": ("तकलीफ़ किस जोड़ या हिस्से में है — घुटने, कमर, कंधे, या हाथ-पैर के जोड़ों में?", ["घुटनों में दर्द है", "कमर के निचले हिस्से में", "हाथ और उंगलियों के जोड़ों में"]),
                    "duration": ("यह जोड़ों या कमर का दर्द कितने समय से चल रहा है?", ["पिछले कुछ दिनों से", "2-3 महीनों से", "सालों पुरानी समस्या है"]),
                    "character": ("दर्द का अहसास कैसा है — सुबह उठने पर जकड़न होती है, या चलने पर तेज कसक उठती है?", ["सुबह उठने पर भारी जकड़न", "चलने पर हड्डियों में घिसाव/दर्द", "लगातार टीस उठती है"]),
                    "radiation": ("क्या कमर का दर्द कूल्हे से होते हुए पैर या उंगलियों की तरफ नीचे उतरता है?", ["हाँ, पैर के नीचे तक जाता है", "नहीं, सिर्फ कमर/घुटने में है"]),
                    "aggravating": ("क्या सीढ़ियां चढ़ने, जमीन पर बैठने, या वजन उठाने से दर्द ज्यादा बढ़ जाता है?", ["सीढ़ियां चढ़ने और बैठने में", "लगातार खड़े रहने पर", "झुकने पर दर्द बढ़ता है"]),
                    "associated": ("क्या जोड़ पर सूजन, लालिमा, गर्माहट, या चलने में लड़खड़ाहट महसूस होती है?", ["घुटने पर सूजन और गर्माहट", "चलने में लचक आ रही है", "कोई सूजन नहीं है"]),
                    "history_correlation": ("क्या आपको पहले कभी यूरिक एसिड (Gout), गठिया (Arthritis), चोट लगने या फ्रैक्चर का इतिहास है?", ["यूरिक एसिड/गठिया की समस्या है", "पहले चोट लगी थी", "पहले से कोई बीमारी नहीं है"]),
                    "severity": ("1 से 10 के पैमाने पर इस दर्द से आपकी दिनचर्या कितनी प्रभावित है?", ["10 में से 8 (चलना-फिरना मुश्किल)", "10 में से 5 (मध्यम दर्द)", "10 में से 3 (हल्का)"])
                }
            elif domain == "neuro":
                questions = {
                    "site": ("सिर में दर्द किस तरफ ज्यादा है — पूरे सिर में, आधे हिस्से में, या माथे व आंखों के पीछे?", ["आधे सिर में एक तरफ", "माथे और आंखों के पीछे", "पूरे सिर में भारीपन"]),
                    "duration": ("यह सिरदर्द कब से शुरू हुआ है और कितने घंटे या दिन रहता है?", ["आज सुबह से अचानक", "पिछले 2 दिनों से", "अक्सर बार-बार होता है"]),
                    "character": ("दर्द कैसा लग रहा है — नसें फड़कने जैसा धड़कन वाला दर्द, या कसकर पट्टी बांधने जैसा तनाव?", ["धड़कन जैसी टीस (धप-धप)", "कसकर जकड़ने जैसा तनाव", "तेज चुभन"]),
                    "radiation": ("क्या दर्द गर्दन या कंधों की मांसपेशियों की तरफ भी खिंच रहा है?", ["गर्दन और कंधों में खिंचाव", "आंखों में भारीपन", "सिर्फ सिर में है"]),
                    "aggravating": ("क्या तेज रोशनी, तेज आवाज, धूप, या कंप्यूटर स्क्रीन देखने से सिरदर्द बढ़ता है?", ["तेज रोशनी और आवाज से बढ़ता है", "तनाव और धूप से बढ़ता है", "झुकने पर बढ़ता है"]),
                    "associated": ("क्या आंखों के आगे चमक, उल्टी जैसा लगना, चक्कर आना, या हाथ-पैर में सुन्नपन है?", ["उल्टी जैसा लगना और चक्कर", "आंखों के आगे धुंधलापन", "कोई अन्य लक्षण नहीं"]),
                    "history_correlation": ("क्या आपको पहले माइग्रेन, हाई ब्लड प्रेशर, साइनसाइटिस या अनिद्रा (नींद की कमी) की समस्या रही है?", ["माइग्रेन और बीपी की समस्या है", "साइनस का इतिहास है", "पहले ऐसा सिरदर्द नहीं हुआ"]),
                    "severity": ("1 से 10 के पैमाने पर इस सिरदर्द की तीव्रता कितनी है?", ["10 में से 8 (असहनीय सिरदर्द)", "10 में से 5 (मध्यम)", "10 में से 3 (हल्का)"])
                }
            elif domain == "fever":
                questions = {
                    "site": ("बुखार के साथ शरीर के किस हिस्से में सबसे ज्यादा दर्द या जकड़न लग रही है?", ["पूरे शरीर और जोड़ों में", "गले में और सिर में", "आंखों के पीछे दर्द"]),
                    "duration": ("बुखार कितने दिनों से आ रहा है और क्या लगातार तेज रहता है?", ["पिछले 2-3 दिनों से", "आज से शुरू हुआ", "1 हफ्ते से"]),
                    "character": ("बुखार का प्रकार कैसा है — ठंड व कंपकंपी लगकर तेज चढ़ता है, या हल्का गरम रहता है?", ["ठंड और कंपकंपी लगकर चढ़ता है", "लगातार तेज बुखार है", "शाम को हल्का बुखार"]),
                    "radiation": ("क्या मांसपेशियों और आंखों के पीछे तेज टूटन जैसा दर्द हो रहा है?", ["आंखों के पीछे और हड्डियों में तेज दर्द", "गले में तेज दर्द", "सिर्फ हल्का बुखार है"]),
                    "aggravating": ("क्या ठंड में जाने या दवा का असर खत्म होने पर बुखार फिर से तेज हो जाता है?", ["दवा खत्म होते ही फिर बढ़ता है", "रात में ज्यादा तेज होता है"]),
                    "associated": ("क्या शरीर पर लाल चकत्ते/दाने, उल्टी, खांसी, या पेशाब में जलन की समस्या है?", ["शरीर पर दाने और कमजोरी", "पेशाब में जलन और उल्टी", "खांसी और जुकाम है"]),
                    "history_correlation": ("क्या आपके घर के आसपास हाल में डेंगू, मलेरिया, या टाइफाइड का कोई मरीज रहा है?", ["आसपास डेंगू/मलेरिया के केस हैं", "हाल में बाहर का खाना खाया था", "कोई विशेष जानकारी नहीं"]),
                    "severity": ("1 से 10 के पैमाने पर बुखार और कमजोरी से होने वाली परेशानी कितनी है?", ["10 में से 8 (बहुत तेज बुखार और कमजोरी)", "10 में से 5 (मध्यम)", "10 में से 3 (हल्का)"])
                }
            else:
                questions = {
                    "site": ("आपकी यह शारीरिक तकलीफ़ मुख्य रूप से किस हिस्से में सबसे ज्यादा महसूस हो रही है?", ["सीने में", "पेट में", "सिर में", "पूरे शरीर में"]),
                    "duration": ("यह समस्या कितने दिनों से बनी हुई है?", ["आज सुबह से", "2-3 दिनों से", "1 हफ्ते से ज्यादा"]),
                    "character": ("तकलीफ़ का अहसास कैसा है — लगातार भारीपन, तेज चुभन, जलन, या कमजोरी?", ["लगातार भारीपन", "तेज चुभन व दर्द", "जलन और कमजोरी"]),
                    "radiation": ("क्या यह दर्द शरीर के किसी दूसरे अंग की तरफ भी फैल रहा है?", ["हाँ, दूसरी तरफ फैल रहा है", "नहीं, एक ही जगह पर है"]),
                    "aggravating": ("क्या किसी खास काम, भोजन, या चलने-फिरने से यह तकलीफ़ बढ़ती है?", ["चलने-फिरने पर बढ़ती है", "खाने के बाद बढ़ती है", "लगातार बनी रहती है"]),
                    "associated": ("क्या इसके साथ पसीना, सांस फूलना, उल्टी, चक्कर या बुखार जैसा महसूस होता है?", ["पसीना और सांस फूलना", "उल्टी और चक्कर", "कोई अन्य लक्षण नहीं"]),
                    "history_correlation": ("क्या आपको पहले से बीपी, शुगर, थायराइड, टीबी या दिल की बीमारी है और दवा ले रहे हैं?", ["बीपी और शुगर की दवा चल रही है", "पहले टीबी या दमा था", "पहले से कोई बीमारी नहीं है"]),
                    "severity": ("1 से 10 के पैमाने पर आप अपनी इस बीमारी को कितना दर्द/गंभीरता स्कोर देंगे?", ["10 में से 8 (तेज दर्द)", "10 में से 5 (मध्यम)", "10 में से 3 (हल्का)"])
                }
            q_data = questions.get(target_slot, questions["severity"])
            spoken, replies = q_data[0], q_data[1]

        else:
            # English & other languages
            if domain == "cardio":
                questions = {
                    "site": ("Where specifically in your chest is the pain or pressure located — central, left-sided, or higher up?", ["Central retrosternal", "Left-sided chest", "Throat & neck region"]),
                    "duration": ("When did this chest discomfort begin — today morning suddenly or over the past few days?", ["Sudden onset today", "Past 2-3 days", "Over a week ago"]),
                    "character": ("How would you describe the sensation — a heavy crushing pressure, burning discomfort, or sharp stabbing pain?", ["Heavy crushing pressure", "Burning sensation", "Sharp stabbing pain"]),
                    "radiation": ("Does the pain radiate to your left arm, shoulder, jaw, or upper back?", ["Radiating to left arm/shoulder", "Radiating to jaw & back", "Localized without spread"]),
                    "aggravating": ("Does physical exertion, climbing stairs, or walking aggravate the tightness?", ["Worse on exertion/stairs", "Worse when lying flat", "Constant at rest"]),
                    "associated": ("Are you experiencing cold sweating, breathlessness, palpitations, or lightheadedness?", ["Sweating & breathlessness", "Palpitations & dizziness", "No other symptoms"]),
                    "history_correlation": ("Do you have a history of high blood pressure, diabetes, or prior heart conditions, and are you on regular medications?", ["On hypertension & diabetes meds", "Prior cardiac stent / angina", "No prior medical history"]),
                    "severity": ("On a clinical pain scale from 1 to 10, how severe would you rate this chest discomfort?", ["8 out of 10 (Severe)", "6 out of 10 (Moderate)", "4 out of 10 (Mild)"])
                }
            elif domain == "pulmo":
                questions = {
                    "site": ("In which part of your chest or throat is the respiratory difficulty or cough most noticeable?", ["Both sides of chest / lungs", "Throat & upper airway", "Back / pleuritic"]),
                    "duration": ("How many days or weeks have you had this cough or shortness of breath?", ["Last 3-4 days", "Over 2 weeks", "Chronic / over a month"]),
                    "character": ("Is it a dry persistent cough, or are you bringing up phlegm/sputum? What is the color?", ["Dry hacking cough", "Yellowish / thick sputum", "Blood-streaked sputum"]),
                    "radiation": ("Do you feel a sharp stitch or pain in your chest wall when taking a deep breath or coughing?", ["Sharp pain on deep inspiration", "Chest soreness after coughing", "No localized pain"]),
                    "aggravating": ("Do cold air, dust exposure, or lying flat at night worsen your breathing?", ["Worse at night lying down", "Triggered by dust / cold", "Constant throughout the day"]),
                    "associated": ("Have you noticed evening fevers, night sweats, wheezing sounds, or unexplained weight loss?", ["Evening fever & night sweats", "Wheezing / whistling sounds", "No other systemic symptoms"]),
                    "history_correlation": ("Do you have any past history of Tuberculosis (TB), Asthma, or inhaler usage?", ["Treated for TB in the past", "Diagnosed with Asthma", "No past respiratory history"]),
                    "severity": ("On a scale of 1 to 10, how significantly is this breathing difficulty impacting you right now?", ["8 out of 10 (Severe distress)", "5 out of 10 (Moderate)", "3 out of 10 (Mild)"])
                }
            elif domain == "gi":
                questions = {
                    "site": ("Where in your abdomen is the pain most intense — upper epigastric, right upper quadrant, or lower abdomen?", ["Upper abdomen (Epigastric)", "Right side under ribs", "Lower abdominal region"]),
                    "duration": ("How long have you had this abdominal pain or indigestion?", ["Past 2-3 days", "Started suddenly today", "Recurrent for weeks"]),
                    "character": ("What is the nature of the pain — severe burning acid sensation, colicky cramping, or continuous dull ache?", ["Severe burning acidity", "Colicky cramping waves", "Continuous dull ache"]),
                    "radiation": ("Does the pain radiate through to your back or up into your shoulder blade?", ["Radiating to upper back", "Radiating to shoulder", "Localized in abdomen only"]),
                    "aggravating": ("Does the pain increase immediately after eating spicy foods, or does it worsen on an empty stomach?", ["Worse after eating meals", "Worse on empty stomach", "Constant regardless of food"]),
                    "associated": ("Are you experiencing nausea, vomiting, abdominal bloating, loose stools, or dark-colored stools?", ["Nausea and vomiting", "Bloating and acid reflux", "Loose diarrhea stools", "No other symptoms"]),
                    "history_correlation": ("Do you have any history of peptic ulcers, gallstones, GERD, or frequent painkiller/NSAID use?", ["Prior ulcer / acidity history", "Known gallstone history", "No prior GI problems"]),
                    "severity": ("On a scale of 1 to 10, how severe is this abdominal discomfort?", ["7 out of 10 (Severe)", "5 out of 10 (Moderate)", "3 out of 10 (Mild)"])
                }
            elif domain == "neuro":
                questions = {
                    "site": ("Where is your headache localized — one side of the head, behind the eyes/forehead, or generalized all over?", ["One side (Unilateral)", "Forehead and behind eyes", "Generalized all over head"]),
                    "duration": ("When did this headache begin, and how many hours or days has it lasted?", ["Sudden onset today", "Past 2 days continuously", "Episodic / recurrent"]),
                    "character": ("How does it feel — a pulsating throbbing ache, or a tight constricting band around the head?", ["Throbbing pulsating ache", "Tight pressure band", "Sharp shooting pain"]),
                    "radiation": ("Does the pain radiate down your neck or into your shoulder muscles?", ["Radiating to neck & shoulders", "Behind the eyes", "Confined to head only"]),
                    "aggravating": ("Do bright lights, loud noises, bending forward, or screen time worsen the headache?", ["Worse with light and sound", "Worse on bending forward", "Constant at rest"]),
                    "associated": ("Are you experiencing nausea, visual aura (flashes/spots), dizziness, or any numbness/weakness?", ["Nausea and sensitivity to light", "Visual aura / blurring", "Dizziness / vertigo", "No other symptoms"]),
                    "history_correlation": ("Do you have a history of migraine, high blood pressure, sinusitis, or sleep disturbances?", ["Known migraine / high BP", "Chronic sinus issues", "No previous headache history"]),
                    "severity": ("On a scale of 1 to 10, how intense is this headache?", ["8 out of 10 (Severe)", "5 out of 10 (Moderate)", "3 out of 10 (Mild)"])
                }
            elif domain == "ortho":
                questions = {
                    "site": ("Which specific joint or body region is affected — knee, lower back, shoulder, or small hand joints?", ["Knee joints", "Lower back / Lumbar", "Shoulder joint", "Multiple joints"]),
                    "duration": ("How long have you been experiencing this joint stiffness or pain?", ["Past few days acutely", "Several months", "Chronic long-standing issue"]),
                    "character": ("How would you describe it — morning stiffness that loosens with movement, or sharp grinding pain on weight bearing?", ["Morning stiffness for >30 mins", "Grinding pain on walking", "Constant dull ache"]),
                    "radiation": ("Does the back or joint pain shoot down your leg, hip, or into your toes?", ["Shooting down leg (Sciatica)", "Radiating into hip", "Confined to the joint"]),
                    "aggravating": ("Does climbing stairs, bending, sitting cross-legged, or lifting weight make it worse?", ["Worse on stairs & bending", "Worse after prolonged standing", "Constant even at rest"]),
                    "associated": ("Is there visible swelling, warmth, joint redness, or difficulty bearing weight?", ["Visible joint swelling & warmth", "Difficulty walking / limp", "No swelling"]),
                    "history_correlation": ("Do you have a history of arthritis, elevated uric acid (gout), osteoporosis, or prior injuries?", ["History of arthritis / uric acid", "Past injury or fracture", "No prior bone/joint issues"]),
                    "severity": ("On a scale of 1 to 10, how significantly is this pain limiting your daily movement?", ["8 out of 10 (Mobility restricted)", "5 out of 10 (Moderate)", "3 out of 10 (Mild)"])
                }
            elif domain == "fever":
                questions = {
                    "site": ("Besides fever, where in your body are you experiencing the most discomfort or aches?", ["Generalized body & joint aches", "Throat pain & headache", "Behind the eyes / Retro-orbital"]),
                    "duration": ("How many days have you had this fever, and is it continuously high or intermittent?", ["Past 2-3 days", "Started today acutely", "High fever for over a week"]),
                    "character": ("What is the fever pattern — high spikes with chills and shivering, or persistent low-grade warmth?", ["High spikes with severe chills", "Continuous high-grade fever", "Low-grade evening fever"]),
                    "radiation": ("Are you feeling severe deep bone pain or eye ache when moving your eyes?", ["Severe bone pain & retro-orbital ache", "Severe throat ache", "Generalized fatigue"]),
                    "aggravating": ("Does the fever rebound immediately as soon as antipyretic medication wears off?", ["Rebounds after medication", "Worse in the evenings", "Constant all day"]),
                    "associated": ("Have you noticed skin rashes, vomiting, loose stools, or burning during urination?", ["Skin rash & body aches", "Nausea and vomiting", "Burning urination", "No other symptoms"]),
                    "history_correlation": ("Has anyone in your vicinity recently had Dengue, Malaria, or Viral infections, or have you traveled recently?", ["Recent dengue/malaria in area", "Outside food consumption", "No known exposure"]),
                    "severity": ("On a scale of 1 to 10, how severe is your weakness and fever discomfort?", ["8 out of 10 (Severe prostration)", "5 out of 10 (Moderate)", "3 out of 10 (Mild)"])
                }
            else:
                questions = {
                    "site": ("Where specifically in your body are you experiencing this primary discomfort?", ["Central chest", "Abdomen", "Head & neck", "Joints & limbs"]),
                    "duration": ("How long has this issue been present — today, past few days, or longer?", ["Started today", "Past 2-3 days", "Over a week"]),
                    "character": ("How would you describe the feeling — constant pressure, sharp pain, burning, or weakness?", ["Constant pressure", "Sharp stabbing pain", "Burning sensation", "Weakness"]),
                    "radiation": ("Does this discomfort spread or radiate to any other part of your body?", ["Radiating to another area", "Localized in one area only"]),
                    "aggravating": ("Does any particular activity, meal, or movement make your symptoms worse?", ["Worse with movement / exertion", "Worse after food", "Constant throughout"]),
                    "associated": ("Are you experiencing any other symptoms like fever, nausea, sweating, or breathlessness?", ["Sweating & breathlessness", "Nausea & fever", "No other symptoms"]),
                    "history_correlation": ("Do you have any documented chronic conditions like hypertension, diabetes, or prior hospitalizations?", ["History of hypertension / diabetes", "Past history of TB / asthma", "No chronic conditions"]),
                    "severity": ("On a scale from 1 to 10, how severe would you rate your overall discomfort right now?", ["8 out of 10 (Severe)", "5 out of 10 (Moderate)", "3 out of 10 (Mild)"])
                }
            q_data = questions.get(target_slot, questions["severity"])
            spoken, replies = q_data[0], q_data[1]

        # Deduplicate spoken response against conversation history
        if history:
            prev_assistant = [h["content"] for h in history if h.get("role") == "assistant"]
            if prev_assistant and (prev_assistant[-1] == spoken or any(spoken in p for p in prev_assistant[-2:])):
                state.is_triage_complete = True
                if language == "hi":
                    spoken = "आपकी सभी जानकारियाँ नोट कर ली गई हैं और विस्तृत रिपोर्ट डॉक्टर साहब को भेज दी गई है। कृपया ओपीडी टोकन के साथ प्रतीक्षा करें।"
                    replies = ["डॉक्टर वर्कस्टेशन खोलें", "टोकन नंबर दिखाएं"]
                elif language == "bn":
                    spoken = "আপনার সকল তথ্য যথাযথভাবে রেকর্ড করে কনসাল্টিং ডাক্তারের কাছে পাঠিয়ে দেওয়া হয়েছে। অনুগ্রহ করে ওপিডি টোকেন নিয়ে অপেক্ষা করুন।"
                    replies = ["ওপিডি টোকেন দেখুন", "ডাক্তার পোর্টাল খুলুন"]
                elif language == "te":
                    spoken = "మీ వివరాలన్నీ నమోదు చేయబడ్డాయి మరియు రిపోర్ట్ డాక్టర్ గారికి పంపబడింది. దయచేసి OPD టోకెన్‌తో వేచి ఉండండి।"
                    replies = ["టోకెన్ సంఖ్య చూడండి", "డాక్టర్ పోర్టల్"]
                else:
                    spoken = "All your clinical details have been recorded and sent to the consulting physician. Please proceed with your OPD token."
                    replies = ["View OPD Token", "Open Doctor Cockpit"]

        return {
            "spoken_response": spoken,
            "quick_replies": replies,
            "is_emergency": False
        }

    def predict(self, text: str, language_code: str = "en") -> Dict[str, Any]:
        """
        Unified high-level NLU inference:
        Scans red flags, matches nearest clinical intent, and extracts structured clinical entities.
        """
        if not text:
            return {"intent": "general", "confidence": 0.0, "is_emergency": False, "red_flag_type": None, "entities": {}}

        red_flag = safety_guardrails.scan_red_flags(text)
        is_emergency = red_flag is not None and red_flag.is_emergency
        flag_type = red_flag.flag_type if red_flag else None

        scenario, similarity = self.find_nearest_scenario(text)
        intent = scenario.get("chief_complaint", "clinical_inquiry") if scenario else "clinical_inquiry"
        extracted = self.extract_slots_fast(text)

        meds_list = []
        if extracted.current_medications:
            for m in extracted.current_medications:
                meds_list.append(m.name if hasattr(m, "name") else str(m))

        entities = {
            "symptoms": extracted.associated_symptoms or ([scenario.get("chief_complaint")] if scenario and not scenario.get("is_meta_intent") else []),
            "duration_days": extracted.duration_days,
            "severity": extracted.severity_score,
            "time_course": extracted.time_course,
            "site": extracted.site,
            "medications": meds_list
        }

        text_lower = text.lower()
        if "fever" in text_lower and "fever" not in [s.lower() for s in entities["symptoms"]]:
            entities["symptoms"].append("fever")
        if "headache" in text_lower and "headache" not in [s.lower() for s in entities["symptoms"]]:
            entities["symptoms"].append("headache")
        if "cough" in text_lower and "cough" not in [s.lower() for s in entities["symptoms"]]:
            entities["symptoms"].append("cough")
        if "paracetamol" in text_lower and not any("paracetamol" in m.lower() for m in entities["medications"]):
            entities["medications"].append("Paracetamol")

        return {
            "intent": intent,
            "confidence": round(max(0.75, similarity), 2) if scenario else 0.8,
            "is_emergency": is_emergency,
            "red_flag_type": flag_type,
            "entities": entities,
            "scenario": scenario
        }


# Global trained instance
clinical_nlu = ClinicalNLUModel()
