export interface KioskTranslationStrings {
  // Breadcrumbs & Top Bar
  backToKiosk: string;
  kioskActive: string;
  pointOfEntry: string;
  mainTitle: string;
  mainSubtitle: string;

  // Navigation Steps (Streamlined 4-Step Pipeline)
  step1Nav: string;
  step2Nav: string;
  step3Nav: string;
  step4Nav: string;

  // Step 1: Language & Identity
  step1Badge: string;
  step1Title: string;
  step1Subtitle: string;
  whoIsAnswering: string;
  patientSelfIntake: string;
  patientSelfIntakeDesc: string;
  caregiverMode: string;
  caregiverModeDesc: string;
  activeBadge: string;
  patientProfileTitle: string;
  patientNameLabel: string;
  ageGenderLabel: string;
  genderFemale: string;
  genderMale: string;
  genderOther: string;
  abhaIdLabel: string;
  abdmConsentTitle: string;
  abdmConsentDesc: string;
  viewConsentPolicy: string;
  proceedToVoice: string;

  // Step 2: Voice Intake
  step2Badge: string;
  assistantName: string;
  assistantSubtitlePatient: string;
  assistantSubtitleCaregiver: string;
  intakeActiveBadge: string;
  noticePrefix: string;
  noticeText: string;
  aiResponseLabel: string;
  initialGreeting: string;
  capturedStatementLabel: string;
  micStandby: string;
  micLive: string;
  tapToSpeak: (langName: string) => string;
  doneSpeaking: string;
  micListening: string;
  micHint: string;
  typePlaceholder: string;
  quickRepliesTitle: string;
  quickReplies: string[];
  historicalContextTitle: string;
  historicalDisclaimer: string;
  readyForScannerTitle: string;
  readyForScannerSubtitle: string;
  nextScanner: string;

  // Step 3: Past Prescriptions & OCR
  step3Badge: string;
  step3Title: string;
  step3Subtitle: string;
  backToVoice: string;
  generateTokenBtn: string;

  // Step 4: OPD Token
  step4Badge: string;
  step4Title: string;
  step4Subtitle: string;
  downloadPdf: string;
  openDoctorView: string;
  startAnotherIntake: string;
}

export const KIOSK_TRANSLATIONS: Record<string, KioskTranslationStrings> = {
  hi: {
    backToKiosk: "कियोस्क अवलोकन पर वापस जाएं",
    kioskActive: "कियोस्क टर्मिनल #04 सक्रिय",
    pointOfEntry: "प्रवेश बिंदु ट्रायज स्टेशन",
    mainTitle: "लाइव रोगी इनटेक स्टेशन",
    mainSubtitle: "अपना डिजिटल ओपीडी टोकन प्राप्त करने के लिए नीचे दिए गए 4-चरणीय क्लिनिकल इनटेक को पूरा करें।",

    step1Nav: "1. भाषा और पहचान",
    step2Nav: "2. मौखिक इनटेक और संवाद",
    step3Nav: "3. पिछले पर्चे और ओसीआर",
    step4Nav: "4. डिजिटल ओपीडी टोकन",

    step1Badge: "चरण 1 / 4",
    step1Title: "अपनी भाषा और इनटेक मोड चुनें",
    step1Subtitle: "अपनी मातृभाषा या हिंग्लिश में आराम से बोलें। स्वयं-इनटेक या सहायक देखभालकर्ता मोड चुनें।",
    whoIsAnswering: "आज कियोस्क का उत्तर कौन दे रहा है?",
    patientSelfIntake: "रोगी स्वयं-इनटेक",
    patientSelfIntakeDesc: "मैं सीधे अपने लक्षणों का वर्णन कर रहा हूँ।",
    caregiverMode: "सहायक देखभालकर्ता मोड",
    caregiverModeDesc: "मैं किसी बुजुर्ग माता-पिता या परिवार के सदस्य की मदद कर रहा हूँ।",
    activeBadge: "सक्रिय",
    patientProfileTitle: "रोगी पहचान और आभा प्रोफ़ाइल",
    patientNameLabel: "रोगी का पूरा नाम",
    ageGenderLabel: "उम्र और लिंग",
    genderFemale: "महिला",
    genderMale: "पुरुष",
    genderOther: "अन्य",
    abhaIdLabel: "आभा (ABHA) स्वास्थ्य आईडी",
    abdmConsentTitle: "आभा सहमति और गोपनीयता सुरक्षा",
    abdmConsentDesc: "आपकी आवाज़ केवल डॉक्टर को जानकारी देने के लिए सुरक्षित रूप से संसाधित की जाती है।",
    viewConsentPolicy: "सहमति नीति देखें",
    proceedToVoice: "मौखिक इनटेक के लिए आगे बढ़ें",

    step2Badge: "चरण 2 / 4",
    assistantName: "आरोग्य मित्र • एआई पूर्व-परामर्श सहायक",
    assistantSubtitlePatient: "बहुभाषी संवादात्मक इनटेक और संरचित डॉक्टर ब्रीफिंग",
    assistantSubtitleCaregiver: "सहायक देखभालकर्ता मोड सक्रिय",
    intakeActiveBadge: "पूर्व-परामर्श इनटेक सक्रिय",
    noticePrefix: "एआई इनटेक सहायक:",
    noticeText: "आरोग्य मित्र आपके लक्षणों और मेडिकल हिस्ट्री को एकत्रित करके डॉक्टर को संक्षिप्त विवरण देता है। अंतिम निदान और उपचार सीधे आपके चिकित्सक द्वारा प्रदान किया जाता है।",
    aiResponseLabel: "एआई पूर्व-परामर्श सहायक:",
    initialGreeting: "नमस्ते। मैं आपका क्लिनिकल इनटेक सहायक हूँ। कृपया बताएं कि आज आपको क्या परेशानी या बीमारी है — दर्द कहाँ है और कब से हो रहा है?",
    capturedStatementLabel: "दर्ज किया गया मरीज़ का बयान:",
    micStandby: "○ माइक्रोफ़ोन तैयार है",
    micLive: "● लाइव आवाज़ रिकॉर्ड हो रही है",
    tapToSpeak: (langName) => `${langName} में बोलने के लिए दबाएं`,
    doneSpeaking: "बोलना समाप्त (संसाधित करें)",
    micListening: "आपकी आवाज़ सुनी जा रही है... आराम से बोलें।",
    micHint: "अपनी भाषा में बिना किसी झिझक के स्वाभाविक रूप से बोलें।",
    typePlaceholder: "या किसी भी भाषा में लक्षण टाइप करें...",
    quickRepliesTitle: "त्वरित लक्षण सुझाव (उत्तर देने के लिए स्पर्श करें):",
    quickReplies: [
      "2 दिन से छाती में भारीपन और जकड़न",
      "तेज़ बुखार, ठंड लगना और सिरदर्द",
      "खाना खाने के बाद पेट में तेज़ दर्द",
      "लगातार खांसी और सांस लेने में तकलीफ़"
    ],
    historicalContextTitle: "दीर्घकालिक ऐतिहासिक संदर्भ:",
    historicalDisclaimer: "* डॉक्टर के संदर्भ के लिए आभा रिकॉर्ड से स्वचालित रूप से संकलित।",
    readyForScannerTitle: "मौजूदा पर्चे या रिपोर्ट स्कैन करने के लिए तैयार हैं?",
    readyForScannerSubtitle: "दस्तावेज़ जोड़ें या सीधे डिजिटल ओपीडी टोकन बनाएं",
    nextScanner: "अगला: पिछले पर्चे स्कैन करें",

    step3Badge: "चरण 3 / 4",
    step3Title: "मौजूदा पर्चे और लैब रिपोर्ट स्कैन करें",
    step3Subtitle: "स्कैन किए गए दस्तावेज़ आपकी टाइमलाइन में सत्यापित साक्ष्य के रूप में जुड़ जाते हैं।",
    backToVoice: "← मौखिक संवाद पर वापस",
    generateTokenBtn: "डिजिटल ओपीडी टोकन और स्टोरीबोर्ड जनरेट करें",

    step4Badge: "प्रथम-चरण इनटेक पूर्ण और सिंक हुआ",
    step4Title: "आपका पूर्व-परामर्श स्टोरीबोर्ड तैयार है",
    step4Subtitle: "ओपीडी परामर्श डेस्क पर यह डिजिटल टोकन प्रस्तुत करें या डॉक्टर कॉकपिट खोलें।",
    downloadPdf: "आधिकारिक क्लिनिकल रिपोर्ट (PDF) डाउनलोड करें",
    openDoctorView: "डॉक्टर स्टोरीबोर्ड दृश्य खोलें",
    startAnotherIntake: "नया इनटेक शुरू करें"
  },

  te: {
    backToKiosk: "కియోస్క్ అవలోకనానికి తిరిగి వెళ్లండి",
    kioskActive: "కియోస్క్ టెర్మినల్ #04 యాక్టివ్",
    pointOfEntry: "పాయింట్-ఆఫ్-ఎంట్రీ ట్రయాజ్ స్టేషన్",
    mainTitle: "లైవ్ పేషెంట్ ఇన్‌టేక్ స్టేషన్",
    mainSubtitle: "మీ డిజిటల్ OPD టోకెన్ పొందడానికి క్రింది 4-దశల క్లినికల్ ఇన్‌టేక్‌ను పూర్తి చేయండి.",

    step1Nav: "1. భాష & గుర్తింపు",
    step2Nav: "2. వాయిస్ ఇన్‌టేక్ & సంభాషణ",
    step3Nav: "3. గత ప్రిస్క్రిప్షన్లు & OCR",
    step4Nav: "4. డిజిటల్ OPD టోకెన్",

    step1Badge: "దశ 1 / 4",
    step1Title: "మీ భాష & ఇన్‌టేక్ మోడ్ ఎంచుకోండి",
    step1Subtitle: "మీ మాతృభాషలో సౌకర్యవంతంగా మాట్లాడండి. సెల్ఫ్-ఇన్‌టేక్ లేదా సహాయక కేర్‌గివర్ మోడ్ ఎంచుకోండి.",
    whoIsAnswering: "ఈరోజు కియోస్క్‌కి ఎవరు సమాధానం ఇస్తున్నారు?",
    patientSelfIntake: "పేషెంట్ స్వీయ ఇన్‌టేక్",
    patientSelfIntakeDesc: "నా లక్షణాలను నేరుగా వివరిస్తున్నాను.",
    caregiverMode: "సహాయక కేర్‌గివర్ మోడ్",
    caregiverModeDesc: "నేను పెద్దవారికి లేదా కుటుంబ సభ్యునికి సహాయం చేస్తున్నాను.",
    activeBadge: "యాక్టివ్",
    patientProfileTitle: "పేషెంట్ గుర్తింపు & ABHA ప్రొఫైల్",
    patientNameLabel: "పేషెంట్ పూర్తి పేరు",
    ageGenderLabel: "వయస్సు & లింగం",
    genderFemale: "స్త్రీ",
    genderMale: "పురుషుడు",
    genderOther: "ఇతర",
    abhaIdLabel: "ABHA హెల్త్ ID",
    abdmConsentTitle: "ABDM సమ్మతి & గోప్యతా రక్షణలు",
    abdmConsentDesc: "మీ వాయిస్ డాక్టర్ బ్రీఫింగ్ కోసం మాత్రమే సురక్షితంగా ప్రాసెస్ చేయబడుతుంది.",
    viewConsentPolicy: "సమ్మతి విధానం చూడండి",
    proceedToVoice: "వాయిస్ ఇన్‌టేక్‌కు వెళ్లండి",

    step2Badge: "దశ 2 / 4",
    assistantName: "ఆరోగ్య మిత్ర • AI ప్రీ-కన్సల్టేషన్ అసిస్టెంట్",
    assistantSubtitlePatient: "బహుభాషా సంభాషణాత్మక ఇన్‌టేక్ & డాక్టర్ బ్రీఫింగ్",
    assistantSubtitleCaregiver: "సహాయక కేర్‌గివర్ మోడ్ యాక్టివ్",
    intakeActiveBadge: "ప్రీ-కన్సల్టేషన్ ఇన్‌టేక్ యాక్టివ్",
    noticePrefix: "AI ఇన్‌టేక్ అసిస్టెంట్:",
    noticeText: "ఆరోగ్య మిత్ర మీ లక్షణాలు మరియు మెడికల్ హిస్టరీని సేకరించి వైద్యుడికి క్లుప్త సమాచారం అందిస్తుంది. తుది రోగ నిర్ధారణ మరియు మందుల వివరాలు నేరుగా మీ వైద్యుని ద్వారా అందించబడతాయి.",
    aiResponseLabel: "AI ప్రీ-కన్సల్టేషన్ అసిస్టెంట్:",
    initialGreeting: "నమస్కారం. నేను మీ క్లినికల్ ఇన్‌టేక్ అసిస్టెంట్‌ని. మీకు ఏమి ఇబ్బందిగా ఉందో చెప్పండి — ఎక్కడ నొప్పిగా ఉంది, మరియు ఎప్పటి నుండి ఉంది?",
    capturedStatementLabel: "నమోదైన పేషెంట్ సమాచారం:",
    micStandby: "○ మైక్రోఫోన్ సిద్ధంగా ఉంది",
    micLive: "● లైవ్ వాయిస్ రికార్డ్ అవుతోంది",
    tapToSpeak: (langName) => `${langName} లో మాట్లాడటానికి నొక్కండి`,
    doneSpeaking: "మాట్లాడటం పూర్తయింది (ప్రాసెస్ చేయండి)",
    micListening: "మీ వాయిస్ వినబడుతోంది... సౌకర్యవంతంగా మాట్లాడండి.",
    micHint: "మీ మాతృభాషలో స్పష్టంగా మరియు సహజంగా మాట్లాడండి.",
    typePlaceholder: "లేదా ఏదైనా భాషలో లక్షణాలను టైప్ చేయండి...",
    quickRepliesTitle: "త్వరిత లక్షణ సూచనలు (సమాధానం కోసం తాకండి):",
    quickReplies: [
      "2 రోజులుగా ఛాతీలో తీవ్రమైన నొప్పి మరియు ఒత్తిడి",
      "చలి మరియు తలనొప్పితో తీవ్ర జ్వరం",
      "తిన్న తర్వాత తీవ్ర కడుపు నొప్పి",
      "శ్వాస ఆడకపోవడంతో నిరంతర దగ్గు"
    ],
    historicalContextTitle: "చారిత్రక వైద్య రికార్డులు:",
    historicalDisclaimer: "* డాక్టర్ సూచనల కొరకు ABHA రికార్డుల నుండి ఆటోమేటిక్‌గా పొందబడింది.",
    readyForScannerTitle: "గత ప్రిస్క్రిప్షన్లను స్కాన్ చేయడానికి సిద్ధంగా ఉన్నారా?",
    readyForScannerSubtitle: "పత్రాలను జోడించండి లేదా నేరుగా OPD టోకెన్ రూపొందించండి",
    nextScanner: "తర్వాత: గత ప్రిస్క్రిప్షన్లను స్కాన్ చేయండి",

    step3Badge: "దశ 3 / 4",
    step3Title: "ప్రిస్క్రిప్షన్లు & ల్యాబ్ రికార్డులను స్కాన్ చేయండి",
    step3Subtitle: "స్కాన్ చేసిన పత్రాలు మీ టైమ్‌లైన్‌లో ధృవీకరించబడిన ఆధారాలుగా జోడించబడతాయి.",
    backToVoice: "← వాయిస్ ఇన్‌టేక్‌కి తిరిగి వెళ్లండి",
    generateTokenBtn: "డిజిటల్ OPD టోకెన్ & స్టోరీబోర్డ్ రూపొందించండి",

    step4Badge: "మొదటి-దశ ఇన్‌టేక్ పూర్తయింది & సమకాలీకరించబడింది",
    step4Title: "మీ ప్రీ-కన్సల్టేషన్ స్టోరీబోర్డ్ సిద్ధంగా ఉంది",
    step4Subtitle: "OPD కన్సల్టేషన్ డెస్క్ వద్ద ఈ డిజిటల్ టోకెన్‌ను సమర్పించండి లేదా డాక్టర్ కాక్‌పిట్ తెరవండి.",
    downloadPdf: "అధికారిక క్లినికల్ రిపోర్ట్ (PDF) డౌన్‌లోడ్ చేయండి",
    openDoctorView: "డాక్టర్ స్టోరీబోర్డ్ వీక్షించండి",
    startAnotherIntake: "మరొక ఇన్‌టేక్ ప్రారంభించండి"
  },

  ta: {
    backToKiosk: "கியோஸ்க் கண்ணோட்டத்திற்குத் திரும்பு",
    kioskActive: "கியோஸ்க் முனையம் #04 செயலில் உள்ளது",
    pointOfEntry: "நுழைவு நிலை ட்ரையேஜ் நிலையம்",
    mainTitle: "நேரடி நோயாளி உட்கொள்ளல் நிலையம்",
    mainSubtitle: "உங்கள் டிஜிட்டல் ஓபிடி டோக்கனைப் பெற கீழே உள்ள 4-படி மருத்துவ உட்கொள்ளலை முடிக்கவும்.",

    step1Nav: "1. மொழி & அடையாளம்",
    step2Nav: "2. குரல் உட்கொள்ளல் & உரையாடல்",
    step3Nav: "3. கடந்த மருந்துச்சீட்டு & OCR",
    step4Nav: "4. டிஜிட்டல் OPD டோக்கன்",

    step1Badge: "படி 1 / 4",
    step1Title: "உங்கள் மொழி & பயன்முறையைத் தேர்ந்தெடுக்கவும்",
    step1Subtitle: "உங்கள் தாய்மொழியில் வசதியாகப் பேசுங்கள். சுயமாக அல்லது உதவியாளர் பயன்முறையைத் தேர்ந்தெடுக்கவும்.",
    whoIsAnswering: "இன்று கியோஸ்க்கிற்கு யார் பதிலளிக்கிறார்கள்?",
    patientSelfIntake: "நோயாளி சுயமாக உட்கொள்ளல்",
    patientSelfIntakeDesc: "எனது அறிகுறிகளை நான் நேரடியாக விவரிக்கிறேன்.",
    caregiverMode: "உதவியாளர் பயன்முறை",
    caregiverModeDesc: "நான் முதிய பெற்றோர் அல்லது குடும்ப உறுப்பினருக்கு உதவுகிறேன்.",
    activeBadge: "செயலில்",
    patientProfileTitle: "நோயாளி அடையாளம் & ABHA சுயவிவரம்",
    patientNameLabel: "நோயாளியின் முழுப் பெயர்",
    ageGenderLabel: "வயது & பாலினம்",
    genderFemale: "பெண்",
    genderMale: "ஆண்",
    genderOther: "மற்றவை",
    abhaIdLabel: "ABHA சுகாதார ஐடி",
    abdmConsentTitle: "ABDM ஒப்புதல் & தனியுரிமைப் பாதுகாப்பு",
    abdmConsentDesc: "உங்கள் குரல் மருத்துவர் ஆலோசனைக்காக மட்டுமே பாதுகாப்பாக செயலாக்கப்படுகிறது.",
    viewConsentPolicy: "ஒப்புதல் கொள்கையைக் காண்க",
    proceedToVoice: "குரல் உட்கொள்ளலுக்குச் செல்லவும்",

    step2Badge: "படி 2 / 4",
    assistantName: "ஆரோக்கிய மித்ரா • AI முன்-ஆலோசனை உதவியாளர்",
    assistantSubtitlePatient: "பன்மொழி உரையாடல் உட்கொள்ளல் & மருத்துவர் சுருக்கம்",
    assistantSubtitleCaregiver: "உதவியாளர் பயன்முறை செயலில் உள்ளது",
    intakeActiveBadge: "முன்-ஆலோசனை உட்கொள்ளல் செயலில் உள்ளது",
    noticePrefix: "AI உட்கொள்ளல் உதவியாளர்:",
    noticeText: "ஆரோக்கிய மித்ரா உங்கள் அறிகுறிகளையும் மருத்துவ வரலாற்றையும் சேகரித்து மருத்துவருக்கு தெரிவிக்கிறது. இறுதி மருத்துவ நோயறிதல் மற்றும் மருந்துச் சீட்டு உங்கள் மருத்துவரால் நேரடியாக வழங்கப்படும்.",
    aiResponseLabel: "AI முன்-ஆலோசனை உதவியாளர்:",
    initialGreeting: "வணக்கம். நான் உங்கள் மருத்துவ உட்கொள்ளும் உதவியாளர். உங்களுக்கு என்ன பிரச்சனை என்று சொல்லுங்கள் — எங்கு வலிக்கிறது, எவ்வளவு நாட்களாக உள்ளது?",
    capturedStatementLabel: "பதிவுசெய்யப்பட்ட நோயாளியின் தகவல்:",
    micStandby: "○ மைக்ரோஃபோன் தயார்",
    micLive: "● நேரலை குரல் பதிவு செய்யப்படுகிறது",
    tapToSpeak: (langName) => `${langName} இல் பேச தொடவும்`,
    doneSpeaking: "பேசி முடிந்தது (செயலாக்கு)",
    micListening: "உங்கள் குரல் கேட்கப்படுகிறது... வசதியாகப் பேசுங்கள்.",
    micHint: "உங்கள் தாய்மொழியில் இயல்பாகப் பேசுங்கள்.",
    typePlaceholder: "அல்லது எந்த மொழியிலும் அறிகுறிகளைத் தட்டச்சு செய்க...",
    quickRepliesTitle: "விரைவான அறிகுறி பரிந்துரைகள் (பதிலளிக்க தொடவும்):",
    quickReplies: [
      "2 நாட்களாக மார்பில் கடுமையான இறுக்கம் மற்றும் வலி",
      "குளிருடன் கூடிய அதிக காய்ச்சல் மற்றும் தலைவலி",
      "சாப்பிட்ட பிறகு கடுமையான வயிற்று வலி",
      "மூச்சுத்திணறலுடன் தொடர் இருமல்"
    ],
    historicalContextTitle: "வரலாற்று மருத்துவப் பின்னணி:",
    historicalDisclaimer: "* மருத்துவர் பார்வைக்காக ABHA பதிவுகளிலிருந்து தானாகப் பெறப்பட்டது.",
    readyForScannerTitle: "கடந்த கால மருந்துச்சீட்டுகளை ஸ்கேன் செய்யத் தயாரா?",
    readyForScannerSubtitle: "ஆவணங்களைச் சேர்க்கவும் அல்லது நேரடியாக டோக்கனை உருவாக்கவும்",
    nextScanner: "அடுத்து: கடந்த கால மருந்துச்சீட்டுகளை ஸ்கேன் செய்",

    step3Badge: "படி 3 / 4",
    step3Title: "மருந்துச்சீட்டுகள் & ஆய்வக அறிக்கைகளை ஸ்கேன் செய்க",
    step3Subtitle: "ஸ்கேன் செய்யப்பட்ட ஆவணங்கள் உங்கள் காலவரிசையில் சரிபார்க்கப்பட்ட ஆதாரங்களாக சேர்க்கப்படும்.",
    backToVoice: "← குரல் உட்கொள்ளலுக்குத் திரும்பு",
    generateTokenBtn: "டிஜிட்டல் OPD டோக்கன் & ஸ்டோரிபோர்டை உருவாக்கு",

    step4Badge: "முதல்-படி உட்கொள்ளல் முடிந்தது & ஒத்திசைக்கப்பட்டது",
    step4Title: "உங்கள் முன்-ஆலோசனை ஸ்டோரிபோர்டு தயார்",
    step4Subtitle: "OPD ஆலோசனை மேசையில் இந்த டிஜிட்டல் டோக்கனைக் காட்டவும் அல்லது மருத்துவர் காட்சியைத் திறக்கவும்.",
    downloadPdf: "அதிகாரப்பூர்வ மருத்துவ அறிக்கையைப் (PDF) பதிவிறக்குக",
    openDoctorView: "மருத்துவர் ஸ்டோரிபோர்டைத் திறக்கவும்",
    startAnotherIntake: "மற்றொரு உட்கொள்ளலைத் தொடங்கவும்"
  },

  bn: {
    backToKiosk: "কিয়স্ক ওভারভিউতে ফিরে যান",
    kioskActive: "কিয়স্ক টার্মিনাল #04 সক্রিয়",
    pointOfEntry: "পয়েন্ট-অফ-এন্ট্রি ট্রায়াজ স্টেশন",
    mainTitle: "লাইভ রোগী ইনটেক স্টেশন",
    mainSubtitle: "আপনার ডিজিটাল ওপিডি টোকেন পেতে নিচের ৪-ধাপের ক্লিনিক্যাল ইনটেক সম্পন্ন করুন।",

    step1Nav: "1. ভাষা ও পরিচয়",
    step2Nav: "2. ভয়েস ইনটেক ও কথোপকথন",
    step3Nav: "3. পূর্বের প্রেসক্রিপশন ও OCR",
    step4Nav: "4. ডিজিটাল ওপিডি টোকেন",

    step1Badge: "ধাপ ১ / ৪",
    step1Title: "আপনার ভাষা এবং ইনটেক মোড নির্বাচন করুন",
    step1Subtitle: "আপনার মাতৃভাষায় নির্দ্বিধায় কথা বলুন। স্ব-ইনটেক বা সাহায্যকারী কেয়ারগিভার মোড বেছে নিন।",
    whoIsAnswering: "আজ কিয়স্কে কে উত্তর দিচ্ছেন?",
    patientSelfIntake: "রোগীর নিজস্ব ইনটেক",
    patientSelfIntakeDesc: "আমি সরাসরি নিজের লক্ষণগুলি বর্ণনা করছি।",
    caregiverMode: "সহকারী কেয়ারগিভার মোড",
    caregiverModeDesc: "আমি একজন প্রবীণ বা পরিবারের সদস্যকে সাহায্য করছি।",
    activeBadge: "সক্রিয়",
    patientProfileTitle: "রোগীর পরিচয় ও ABHA প্রোফাইল",
    patientNameLabel: "রোগীর পুরো নাম",
    ageGenderLabel: "বয়স ও লিঙ্গ",
    genderFemale: "মহিলা",
    genderMale: "পুরুষ",
    genderOther: "অন্যান্য",
    abhaIdLabel: "ABHA স্বাস্থ্য আইডি",
    abdmConsentTitle: "ABDM সম্মতি ও গোপনীয়তা সুরক্ষা",
    abdmConsentDesc: "আপনার ভয়েস শুধুমাত্র ডাক্তারের ব্রিফিংয়ের জন্য নিরাপদে প্রক্রিয়াকরণ করা হয়।",
    viewConsentPolicy: "সম্মতি নীতি দেখুন",
    proceedToVoice: "ভয়েস ইনটেকে এগিয়ে যান",

    step2Badge: "ধাপ ২ / ৪",
    assistantName: "আরোগ্য মিত্র • এআই প্রাক-পরামর্শ সহকারী",
    assistantSubtitlePatient: "বহুভাষিক কথোপকথন ইনটেক এবং কাঠামোগত ডাক্তার ব্রিফিং",
    assistantSubtitleCaregiver: "সহকারী কেয়ারগিভার মোড সক্রিয়",
    intakeActiveBadge: "প্রাক-পরামর্শ ইনটেক সক্রিয়",
    noticePrefix: "এআই ইনটেক অ্যাসিস্ট্যান্ট:",
    noticeText: "আরোগ্য মিত্র আপনার উপসর্গ এবং চিকিৎসার ইতিহাস সংগ্রহ করে ডাক্তারকে জানানোর জন্য সংক্ষিপ্ত বিবরণ তৈরি করে। চূড়ান্ত চিকিৎসা নির্ণয় এবং প্রেসক্রিপশন সরাসরি আপনার ডাক্তার প্রদান করবেন।",
    aiResponseLabel: "এআই প্রাক-পরামর্শ সহকারী:",
    initialGreeting: "নমস্কার। আমি আপনার ক্লিনিক্যাল ইনটেক সহকারী। আজ আপনার কী সমস্যা হচ্ছে বলুন — কোথায় ব্যথা করছে এবং কত দিন ধরে হচ্ছে?",
    capturedStatementLabel: "রেকর্ডকৃত রোগীর বক্তব্য:",
    micStandby: "○ মাইক্রোফোন প্রস্তুত",
    micLive: "● সরাসরি ভয়েস রেকর্ড হচ্ছে",
    tapToSpeak: (langName) => `${langName}-এ কথা বলতে স্পর্শ করুন`,
    doneSpeaking: "কথা বলা শেষ (প্রসেস করুন)",
    micListening: "আপনার ভয়েস শোনা হচ্ছে... স্বাচ্ছন্দ্যে কথা বলুন।",
    micHint: "আপনার মাতৃভাষায় স্বাভাবিকভাবে কথা বলুন।",
    typePlaceholder: "অথবা যেকোনো ভাষায় লক্ষণ টাইপ করুন...",
    quickRepliesTitle: "দ্রুত লক্ষণ পরামর্শ (উত্তর দিতে স্পর্শ করুন):",
    quickReplies: [
      "২ দিন ধরে বুকে প্রচণ্ড চাপ ও অস্বস্তি",
      "ঠান্ডা লাগা এবং মাথা ব্যথাসহ তীব্র জ্বর",
      "খাওয়ার পর পেটে প্রচণ্ড ব্যথা",
      "শ্বাসকষ্টসহ ক্রমাগত কাশি"
    ],
    historicalContextTitle: "পূর্ববর্তী চিকিৎসার ইতিহাস:",
    historicalDisclaimer: "* ডাক্তারের রেফারেন্সের জন্য ABHA রেকর্ড থেকে স্বয়ংক্রিয়ভাবে সংগৃহীত।",
    readyForScannerTitle: "পূর্ববর্তী প্রেসক্রিপশন স্ক্যান করতে প্রস্তুত?",
    readyForScannerSubtitle: "ডকুমেন্ট যুক্ত করুন বা সরাসরি ওপিডি টোকেন তৈরি করুন",
    nextScanner: "পরবর্তী: পূর্ববর্তী প্রেসক্রিপশন স্ক্যান করুন",

    step3Badge: "ধাপ ৩ / ৪",
    step3Title: "প্রেসক্রিপশন এবং ল্যাব রিপোর্ট স্ক্যান করুন",
    step3Subtitle: "স্ক্যান করা নথিগুলি আপনার টাইমলাইনে যাচাইকৃত প্রমাণ হিসাবে যুক্ত হবে।",
    backToVoice: "← ভয়েস ইনটেকে ফিরে যান",
    generateTokenBtn: "ডিজিটাল ওপিডি টোকেন এবং স্টোরিবোর্ড তৈরি করুন",

    step4Badge: "প্রথম-ধাপের ইনটেক সম্পন্ন ও সিঙ্ক হয়েছে",
    step4Title: "আপনার প্রাক-পরামর্শ স্টোরিবোর্ড প্রস্তুত",
    step4Subtitle: "ওপিডি পরামর্শ ডেস্কে এই ডিজিটাল টোকেনটি দেখান বা ডাক্তার ককপিট খুলুন।",
    downloadPdf: "অফিসিয়াল ক্লিনিক্যাল রিপোর্ট (PDF) ডাউনলোড করুন",
    openDoctorView: "ডাক্তার স্টোরিবোর্ড ভিউ খুলুন",
    startAnotherIntake: "নতুন ইনটেক শুরু করুন"
  },

  mr: {
    backToKiosk: "किओस्क विहंगावलोकनावर परत जा",
    kioskActive: "किओस्क टर्मिनल #04 सक्रिय",
    pointOfEntry: "पॉइंट-ऑफ-एंट्री ट्रायज स्टेशन",
    mainTitle: "थेट रुग्ण इनटेक स्टेशन",
    mainSubtitle: "तुमचे डिजिटल ओपीडी टोकन मिळवण्यासाठी खालील ४-टप्प्यांची क्लिनिकल तपासणी पूर्ण करा.",

    step1Nav: "1. भाषा आणि ओळख",
    step2Nav: "2. व्हॉइस इनटेक आणि संवाद",
    step3Nav: "3. मागील प्रिस्क्रिप्शन आणि OCR",
    step4Nav: "4. डिजिटल ओपीडी टोकन",

    step1Badge: "टप्पा १ / ४",
    step1Title: "तुमची भाषा आणि इनटेक मोड निवडा",
    step1Subtitle: "तुमच्या मातृभाषेत किंवा हिंग्लिशमध्ये मोकळेपणाने बोला. स्वतः किंवा सहाय्यक मोड निवडा.",
    whoIsAnswering: "आज किओस्कला कोण उत्तर देत आहे?",
    patientSelfIntake: "रुग्ण स्वतः इनटेक",
    patientSelfIntakeDesc: "मी थेट माझ्या लक्षणांचे वर्णन करत आहे.",
    caregiverMode: "सहाय्यक केअरगिव्हर मोड",
    caregiverModeDesc: "मी ज्येष्ठ पालक किंवा कुटुंबातील सदस्याला मदत करत आहे.",
    activeBadge: "सक्रिय",
    patientProfileTitle: "रुग्ण ओळख आणि आभा (ABHA) प्रोफाइल",
    patientNameLabel: "रुग्णाचे पूर्ण नाव",
    ageGenderLabel: "वय आणि लिंग",
    genderFemale: "महिला",
    genderMale: "पुरुष",
    genderOther: "इतर",
    abhaIdLabel: "आभा (ABHA) आरोग्य आयडी",
    abdmConsentTitle: "ABDM संमती आणि गोपनीयता संरक्षण",
    abdmConsentDesc: "तुमचा आवाज केवळ डॉक्टरांच्या संदर्भासाठी सुरक्षितपणे प्रक्रिया केला जातो.",
    viewConsentPolicy: "संमती धोरण पहा",
    proceedToVoice: "व्हॉइस इनटेकसाठी पुढे जा",

    step2Badge: "टप्पा २ / ४",
    assistantName: "आरोग्य मित्र • AI पूर्व-सल्लागार सहाय्यक",
    assistantSubtitlePatient: "बहुभाषिक संवादात्मक इनटेक आणि डॉक्टरांसाठी संक्षिप्त माहिती",
    assistantSubtitleCaregiver: "सहाय्यक केअरगिव्हर मोड सक्रिय",
    intakeActiveBadge: "पूर्व-सल्लागार इनटेक सक्रिय",
    noticePrefix: "AI इनटेक सहाय्यक:",
    noticeText: "आरोग्य मित्र तुमच्या लक्षणांची आणि वैद्यकीय इतिहासाची माहिती गोळा करून डॉक्टरांना संक्षिप्त माहिती देतो. अंतिम वैद्यकीय निदान आणि औषधे थेट तुमच्या डॉक्टरांकडून दिली जातील.",
    aiResponseLabel: "AI पूर्व-सल्लागार सहाय्यक:",
    initialGreeting: "नमस्कार. मी तुमचा क्लिनिकल इनटेक सहाय्यक आहे. आज तुम्हाला काय त्रास होत आहे ते सांगा — कुठे दुखत आहे आणि किती दिवसांपासून आहे?",
    capturedStatementLabel: "नोंदवलेले रुग्णाचे म्हणणे:",
    micStandby: "○ मायक्रोफोन सज्ज आहे",
    micLive: "● थेट आवाज रेकॉर्ड होत आहे",
    tapToSpeak: (langName) => `${langName} मध्ये बोलण्यासाठी टॅप करा`,
    doneSpeaking: "बोलणे पूर्ण झाले (प्रक्रिया करा)",
    micListening: "तुमचा आवाज ऐकला जात आहे... आरामात बोला.",
    micHint: "तुमच्या मातृभाषेत नैसर्गिकरित्या बोला.",
    typePlaceholder: "किंवा कोणत्याही भाषेत लक्षणे टाइप करा...",
    quickRepliesTitle: "त्वरित लक्षण सूचना (उत्तर देण्यासाठी टॅप करा):",
    quickReplies: [
      "२ दिवसांपासून छातीत तीव्र जडपणा आणि वेदना",
      "थंडी वाजून तीव्र ताप आणि डोकेदुखी",
      "जेवणानंतर पोटात तीव्र वेदना",
      "श्वास घेण्यास त्रासासह सतत खोकला"
    ],
    historicalContextTitle: "मागील वैद्यकीय इतिहास:",
    historicalDisclaimer: "* डॉक्टरांच्या संदर्भासाठी आभा रेकॉर्डमधून स्वयंचलितपणे संकलित.",
    readyForScannerTitle: "मागील प्रिस्क्रिप्शन स्कॅन करण्यासाठी तयार आहात का?",
    readyForScannerSubtitle: "कागदपत्रे जोडा किंवा थेट ओपीडी टोकन तयार करा",
    nextScanner: "पुढे: मागील प्रिस्क्रिप्शन स्कॅन करा",

    step3Badge: "टप्पा ३ / ४",
    step3Title: "प्रिस्क्रिप्शन आणि लॅब रिपोर्ट स्कॅन करा",
    step3Subtitle: "स्कॅन केलेले दस्तऐवज तुमच्या टाइमलाइनमध्ये सत्यापित पुरावे म्हणून जोडले जातील.",
    backToVoice: "← व्हॉइस इनटेकवर परत जा",
    generateTokenBtn: "डिजिटल ओपीडी टोकन आणि स्टोरीबोर्ड तयार करा",

    step4Badge: "प्रथम-टप्पा इनटेक पूर्ण आणि सिंक झाला",
    step4Title: "तुमचा पूर्व-सल्लागार स्टोरीबोर्ड तयार आहे",
    step4Subtitle: "ओपीडी सल्लागार डेस्कवर हे डिजिटल टोकन दाखवा किंवा डॉक्टर कॉकपिट उघडा.",
    downloadPdf: "अधिकृत क्लिनिकल अहवाल (PDF) डाउनलोड करा",
    openDoctorView: "डॉक्टर स्टोरीबोर्ड दृश्य उघडा",
    startAnotherIntake: "नवीन इनटेक सुरू करा"
  },

  gu: {
    backToKiosk: "કિયોસ્ક ઝાંખી પર પાછા જાઓ",
    kioskActive: "કિયોસ્ક ટર્મિનલ #04 સક્રિય",
    pointOfEntry: "પોઇન્ટ-ઓફ-એન્ટ્રી ટ્રાયજ સ્ટેશન",
    mainTitle: "લાઇવ પેશન્ટ ઇનટેક સ્ટેશન",
    mainSubtitle: "તમારું ડિજિટલ OPD ટોકન મેળવવા માટે નીચેના 4-પગલાંનું ક્લિનિકલ ઇનટેક પૂર્ણ કરો.",

    step1Nav: "1. ભાષા અને ઓળખ",
    step2Nav: "2. વૉઇસ ઇનટેક અને સંવાદ",
    step3Nav: "3. જૂના પ્રિસ્ક્રિપ્શન અને OCR",
    step4Nav: "4. ડિજિટલ OPD ટોકન",

    step1Badge: "પગલું 1 / 4",
    step1Title: "તમારી ભાષા અને ઇનટેક મોડ પસંદ કરો",
    step1Subtitle: "તમારી માતૃભાષામાં આરામથી બોલો. સ્વ-ઇનટેક અથવા સહાયક સંભાળ રાખનાર મોડ પસંદ કરો.",
    whoIsAnswering: "આજે કિયોસ્કનો જવાબ કોણ આપી રહ્યું છે?",
    patientSelfIntake: "દર્દી સ્વ-ઇનટેક",
    patientSelfIntakeDesc: "હું સીધા મારા પોતાના લક્ષણોનું વર્ણન કરું છું.",
    caregiverMode: "સહાયક સંભાળ રાખનાર મોડ",
    caregiverModeDesc: "હું પરિવારના સભ્ય અથવા વડીલને મદદ કરી રહ્યો છું.",
    activeBadge: "સક્રિય",
    patientProfileTitle: "દર્દી ઓળખ અને ABHA પ્રોફાઇલ",
    patientNameLabel: "દર્દીનું પૂરું નામ",
    ageGenderLabel: "ઉંમર અને જાતિ",
    genderFemale: "સ્ત્રી",
    genderMale: "પુરુષ",
    genderOther: "અન્ય",
    abhaIdLabel: "ABHA હેલ્થ ID",
    abdmConsentTitle: "ABDM સંમતિ અને ગોપનીયતા સુરક્ષા",
    abdmConsentDesc: "તમારો અવાજ માત્ર ડૉક્ટરને માહિતી આપવા માટે સુરક્ષિત રીતે પ્રોસેસ થાય છે.",
    viewConsentPolicy: "સંમતિ નીતિ જુઓ",
    proceedToVoice: "વૉઇસ ઇનટેક માટે આગળ વધો",

    step2Badge: "પગલું 2 / 4",
    assistantName: "આરોગ્ય મિત્ર • AI પૂર્વ-પરામર્શ સહાયક",
    assistantSubtitlePatient: "બહુભાષી સંવાદાત્મક ઇનટેક અને ડૉક્ટર બ્રીફિંગ",
    assistantSubtitleCaregiver: "સહાયક મોડ સક્રિય",
    intakeActiveBadge: "પૂર્વ-પરામર્શ ઇનટેક સક્રિય",
    noticePrefix: "AI ઇનટેક સહાયક:",
    noticeText: "આરોગ્ય મિત્ર તમારા લક્ષણો અને તબીબી ઇતિહાસ એકત્રિત કરીને ડૉક્ટરને સંક્ષિપ્ત માહિતી આપે છે. અંતિમ તબીબી નિદાન અને દવાઓ સીધા તમારા ચિકિત્સક દ્વારા આપવામાં આવે છે.",
    aiResponseLabel: "AI પૂર્વ-પરામર્શ સહાયક:",
    initialGreeting: "નમસ્તે. હું તમારો ક્લિનિકલ ઇનટેક સહાયક છું. આજે તમને શું તકલીફ છે તે જણાવો — ક્યાં દુખાવો થાય છે અને ક્યારથી થાય છે?",
    capturedStatementLabel: "નોંધાયેલ દર્દીનું નિવેદન:",
    micStandby: "○ માઇક્રોફોન તૈયાર છે",
    micLive: "● લાઇવ અવાજ રેકોર્ડ થઈ રહ્યો છે",
    tapToSpeak: (langName) => `${langName} માં બોલવા માટે ટેપ કરો`,
    doneSpeaking: "બોલવાનું સમાપ્ત (પ્રોસેસ કરો)",
    micListening: "તમારો અવાજ સંભળાઈ રહ્યો છે... આરામથી બોલો.",
    micHint: "તમારી માતૃભાષામાં સ્વાભાવિક રીતે બોલો.",
    typePlaceholder: "અથવા કોઈપણ ભાષામાં લક્ષણો લખો...",
    quickRepliesTitle: "ઝડપી લક્ષણ સૂચનો (જવાબ આપવા માટે ટેપ કરો):",
    quickReplies: [
      "૨ દિવસથી છાતીમાં ભારેપણું અને દુખાવો",
      "ધ્રુજારી અને માથાના દુખાવા સાથે તાવ",
      "જમ્યા પછી પેટમાં તીવ્ર દુખાવો",
      "શ્વાસ લેવામાં તકલીફ સાથે સતત ઉધરસ"
    ],
    historicalContextTitle: "તબીબી ઇતિહાસ સંદર્ભ:",
    historicalDisclaimer: "* ડૉક્ટરના સંદર્ભ માટે ABHA રેકોર્ડ્સમાંથી આપમેળે લેવામાં આવ્યું છે.",
    readyForScannerTitle: "જૂના પ્રિસ્ક્રિપ્શન સ્કેન કરવા તૈયાર છો?",
    readyForScannerSubtitle: "દસ્તાવેજો ઉમેરો અથવા સીધું OPD ટોકન બનાવો",
    nextScanner: "આગળ: જૂના પ્રિસ્ક્રિપ્શન સ્કેન કરો",

    step3Badge: "પગલું 3 / 4",
    step3Title: "પ્રિસ્ક્રિપ્શન અને લેબ રિપોર્ટ સ્કેન કરો",
    step3Subtitle: "સ્કેન કરેલા દસ્તાવેજો તમારી સમયરેખામાં ચકાસાયેલ પુરાવા તરીકે ઉમેરાશે.",
    backToVoice: "← વૉઇસ ઇનટેક પર પાછા જાઓ",
    generateTokenBtn: "ડિજિટલ OPD ટોકન અને સ્ટોરીબોર્ડ બનાવો",

    step4Badge: "પ્રથમ-પગલાંનું ઇનટેક પૂર્ણ અને સિંક થયું",
    step4Title: "તમારો પૂર્વ-પરામર્શ સ્ટોરીબોર્ડ તૈયાર છે",
    step4Subtitle: "OPD કન્સલ્ટેશન ડેસ્ક પર આ ડિજિટલ ટોકન રજૂ કરો અથવા ડૉક્ટર કોકપિટ ખોલો.",
    downloadPdf: "સત્તાવાર ક્લિનિકલ રિપોર્ટ (PDF) ડાઉનલોડ કરો",
    openDoctorView: "ડૉક્ટર સ્ટોરીબોર્ડ જુઓ",
    startAnotherIntake: "નવું ઇનટેક શરૂ કરો"
  },

  kn: {
    backToKiosk: "ಕಿಯೋಸ್ಕ್ ಅವಲೋಕನಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    kioskActive: "ಕಿಯೋಸ್ಕ್ ಟರ್ಮಿನಲ್ #04 ಸಕ್ರಿಯವಾಗಿದೆ",
    pointOfEntry: "ಪಾಯಿಂಟ್-ಆಫ್-ಎಂಟ್ರಿ ಟ್ರಯೇಜ್ ಸ್ಟೇಷನ್",
    mainTitle: "ಲೈವ್ ರೋಗಿ ಇನ್‌ಟೇಕ್ ಸ್ಟೇಷನ್",
    mainSubtitle: "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಒಪಿಡಿ ಟೋಕನ್ ಪಡೆಯಲು ಕೆಳಗಿನ 4-ಹಂತದ ಕ್ಲಿನಿಕಲ್ ಇನ್‌ಟೇಕ್ ಪೂರ್ಣಗೊಳಿಸಿ.",

    step1Nav: "1. ಭಾಷೆ ಮತ್ತು ಗುರುತು",
    step2Nav: "2. ಧ್ವನಿ ಇನ್‌ಟೇಕ್ ಮತ್ತು ಸಂಭಾಷಣೆ",
    step3Nav: "3. ಹಿಂದಿನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು OCR",
    step4Nav: "4. ಡಿಜಿಟಲ್ OPD ಟೋಕನ್",

    step1Badge: "ಹಂತ 1 / 4",
    step1Title: "ನಿಮ್ಮ ಭಾಷೆ ಮತ್ತು ಇನ್‌ಟೇಕ್ ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ",
    step1Subtitle: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿ. ಸ್ವಯಂ ಅಥವಾ ಸಹಾಯಕ ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ.",
    whoIsAnswering: "ಇಂದು ಕಿಯೋಸ್ಕ್‌ಗೆ ಯಾರು ಉತ್ತರಿಸುತ್ತಿದ್ದಾರೆ?",
    patientSelfIntake: "ರೋಗಿಯ ಸ್ವಯಂ ಇನ್‌ಟೇಕ್",
    patientSelfIntakeDesc: "ನಾನು ನೇರವಾಗಿ ನನ್ನ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸುತ್ತಿದ್ದೇನೆ.",
    caregiverMode: "ಸಹಾಯಕ ಕೇರ್‌ಗಿವರ್ ಮೋಡ್",
    caregiverModeDesc: "ನಾನು ಕುಟುಂಬದ ಹಿರಿಯರಿಗೆ ಅಥವಾ ಸದಸ್ಯರಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತಿದ್ದೇನೆ.",
    activeBadge: "ಸಕ್ರಿಯ",
    patientProfileTitle: "ರೋಗಿಯ ಗುರುತು ಮತ್ತು ABHA ಪ್ರೊಫೈಲ್",
    patientNameLabel: "ರೋಗಿಯ ಪೂರ್ಣ ಹೆಸರು",
    ageGenderLabel: "ವಯಸ್ಸು ಮತ್ತು ಲಿಂಗ",
    genderFemale: "ಮಹಿಳೆ",
    genderMale: "ಪುರುಷ",
    genderOther: "ಇತರೆ",
    abhaIdLabel: "ABHA ಆರೋಗ್ಯ ಐಡಿ",
    abdmConsentTitle: "ABDM ಸಮ್ಮತಿ ಮತ್ತು ಗೌಪ್ಯತೆ ರಕ್ಷಣೆ",
    abdmConsentDesc: "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ವೈದ್ಯರ ಸಮಾಲೋಚನೆಗಾಗಿ ಮಾತ್ರ ಸುರಕ್ಷಿತವಾಗಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತದೆ.",
    viewConsentPolicy: "ಸಮ್ಮತಿ ನೀತಿ ವೀಕ್ಷಿಸಿ",
    proceedToVoice: "ಧ್ವನಿ ಇನ್‌ಟೇಕ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ",

    step2Badge: "ಹಂತ 2 / 4",
    assistantName: "ಆರೋಗ್ಯ ಮಿತ್ರ • AI ಪೂರ್ವ-ಸಮಾಲೋಚನಾ ಸಹಾಯಕ",
    assistantSubtitlePatient: "ಬಹುಭಾಷಾ ಸಂಭಾಷಣೆ ಮತ್ತು ವೈದ್ಯರ ಬ್ರೀಫಿಂಗ್",
    assistantSubtitleCaregiver: "ಸಹಾಯಕ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    intakeActiveBadge: "ಪೂರ್ವ-ಸಮಾಲೋಚನಾ ಇನ್‌ಟೇಕ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    noticePrefix: "AI ಇನ್‌ಟೇಕ್ ಸಹಾಯಕ:",
    noticeText: "ಆರೋಗ್ಯ ಮಿತ್ರ ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳು ಮತ್ತು ವೈದ್ಯಕೀಯ ಇತಿಹಾಸವನ್ನು ಸಂಗ್ರಹಿಸಿ ವೈದ್ಯರಿಗೆ ಸಂಕ್ಷಿಪ್ತ ವಿವರ ನೀಡುತ್ತದೆ. ಅಂತಿಮ ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯ ಮತ್ತು ಔಷಧಿಗಳನ್ನು ನೇರವಾಗಿ ನಿಮ್ಮ ವೈದ್ಯರು ನೀಡುತ್ತಾರೆ.",
    aiResponseLabel: "AI ಪೂರ್ವ-ಸಮಾಲೋಚನಾ ಸಹಾಯಕ:",
    initialGreeting: "ನಮಸ್ಕಾರ. ನಾನು ನಿಮ್ಮ ಕ್ಲಿನಿಕಲ್ ಇನ್‌ಟೇಕ್ ಸಹಾಯಕ. ನಿಮಗೆ ಏನು ತೊಂದರೆಯಾಗಿದೆ ತಿಳಿಸಿ — ಎಲ್ಲಿ ನೋವಿದೆ ಮತ್ತು ಎಷ್ಟು ಸಮಯದಿಂದ ಇದೆ?",
    capturedStatementLabel: "ದಾಖಲಾದ ರೋಗಿಯ ಹೇಳಿಕೆ:",
    micStandby: "○ ಮೈಕ್ರೊಫೋನ್ ಸಿದ್ಧವಾಗಿದೆ",
    micLive: "● ಲೈವ್ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ",
    tapToSpeak: (langName) => `${langName} ನಲ್ಲಿ ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ`,
    doneSpeaking: "ಮಾತನಾಡುವುದು ಮುಗಿದಿದೆ (ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿ)",
    micListening: "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಆರಾಮವಾಗಿ ಮಾತನಾಡಿ.",
    micHint: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ನೈಸರ್ಗಿಕವಾಗಿ ಮಾತನಾಡಿ.",
    typePlaceholder: "ಅಥವಾ ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಟೈಪ್ ಮಾಡಿ...",
    quickRepliesTitle: "ತ್ವರಿತ ರೋಗಲಕ್ಷಣ ಸಲಹೆಗಳು (ಉತ್ತರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ):",
    quickReplies: [
      "2 ದಿನಗಳಿಂದ ಎದೆಯಲ್ಲಿ ತೀವ್ರ ಬಿಗಿತ ಮತ್ತು ನೋವು",
      "ಚಳಿ ಮತ್ತು ತಲೆನೋವಿನೊಂದಿಗೆ ತೀವ್ರ ಜ್ವರ",
      "ಊಟದ ನಂತರ ಹೊಟ್ಟೆಯಲ್ಲಿ ತೀವ್ರ ನೋವು",
      "ಉಸಿರಾಟದ ತೊಂದರೆಯೊಂದಿಗೆ ನಿರಂತರ ಕೆಮ್ಮು"
    ],
    historicalContextTitle: "ವೈದ್ಯಕೀಯ ಇತಿಹಾಸದ ಹಿನ್ನೆಲೆ:",
    historicalDisclaimer: "* ವೈದ್ಯರ ಉಲ್ಲೇಖಕ್ಕಾಗಿ ABHA ದಾಖಲೆಗಳಿಂದ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪಡೆಯಲಾಗಿದೆ.",
    readyForScannerTitle: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
    readyForScannerSubtitle: "ದಾಖಲೆಗಳನ್ನು ಸೇರಿಸಿ ಅಥವಾ ನೇರವಾಗಿ ಟೋಕನ್ ರಚಿಸಿ",
    nextScanner: "ಮುಂದೆ: ಹಿಂದಿನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",

    step3Badge: "ಹಂತ 3 / 4",
    step3Title: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು ಮತ್ತು ಲ್ಯಾಬ್ ವರದಿಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    step3Subtitle: "ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ದಾಖಲೆಗಳನ್ನು ನಿಮ್ಮ ಟೈಮ್‌ಲೈನ್‌ನಲ್ಲಿ ಸಾಕ್ಷಿಯಾಗಿ ಸೇರಿಸಲಾಗುತ್ತದೆ.",
    backToVoice: "← ಧ್ವನಿ ಇನ್‌ಟೇಕ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    generateTokenBtn: "ಡಿಜಿಟಲ್ OPD ಟೋಕನ್ ಮತ್ತು ಸ್ಟೋರಿಬೋರ್ಡ್ ರಚಿಸಿ",

    step4Badge: "ಮೊದಲ-ಹಂತದ ಇನ್‌ಟೇಕ್ ಪೂರ್ಣಗೊಂಡಿದೆ ಮತ್ತು ಸಿಂಕ್ ಆಗಿದೆ",
    step4Title: "ನಿಮ್ಮ ಪೂರ್ವ-ಸಮಾಲೋಚನಾ ಸ್ಟೋರಿಬೋರ್ಡ್ ಸಿದ್ಧವಾಗಿದೆ",
    step4Subtitle: "OPD ಸಮಾಲೋಚನಾ ಡೆಸ್ಕ್‌ನಲ್ಲಿ ಈ ಡಿಜಿಟಲ್ ಟೋಕನ್ ಪ್ರಸ್ತುತಪಡಿಸಿ ಅಥವಾ ವೈದ್ಯರ ವೀಕ್ಷಣೆ ತೆರೆಯಿರಿ.",
    downloadPdf: "ಅಧಿಕೃತ ಕ್ಲಿನಿಕಲ್ ವರದಿ (PDF) ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    openDoctorView: "ವೈದ್ಯರ ಸ್ಟೋರಿಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ",
    startAnotherIntake: "ಮತ್ತೊಂದು ಇನ್‌ಟೇಕ್ ಪ್ರಾರಂಭಿಸಿ"
  },

  en: {
    backToKiosk: "Back to Kiosk Overview",
    kioskActive: "Kiosk Terminal #04 Active",
    pointOfEntry: "Point-of-Entry Triage Station",
    mainTitle: "Live Patient Intake Station",
    mainSubtitle: "Complete the 4-step clinical intake below to receive your digital OPD token.",

    step1Nav: "1. Language & Identity",
    step2Nav: "2. Spoken Intake & Dialogue",
    step3Nav: "3. Past Prescriptions & OCR",
    step4Nav: "4. Digital OPD Token",

    step1Badge: "Step 1 of 4",
    step1Title: "Select Your Language & Intake Mode",
    step1Subtitle: "Speak comfortably in your native tongue or Hinglish. Choose self-intake or assisted caregiver mode.",
    whoIsAnswering: "Who is Answering the Kiosk Today?",
    patientSelfIntake: "Patient Self-Intake",
    patientSelfIntakeDesc: "I am describing my own symptoms directly.",
    caregiverMode: "Assisted Caregiver Mode",
    caregiverModeDesc: "I am helping an elderly parent or family member.",
    activeBadge: "ACTIVE",
    patientProfileTitle: "Patient Identity & ABHA Profile",
    patientNameLabel: "Patient Full Name",
    ageGenderLabel: "Age & Gender",
    genderFemale: "Female",
    genderMale: "Male",
    genderOther: "Other",
    abhaIdLabel: "ABHA Health ID",
    abdmConsentTitle: "ABDM Consent & Privacy Safeguards",
    abdmConsentDesc: "Your voice is processed securely for doctor briefing only.",
    viewConsentPolicy: "View Consent Policy",
    proceedToVoice: "Proceed to Spoken Intake",

    step2Badge: "Step 2 of 4",
    assistantName: "Aarogya Mitra • AI Pre-Consultation Assistant",
    assistantSubtitlePatient: "Multilingual conversational intake & structured doctor briefing",
    assistantSubtitleCaregiver: "Assisted Caregiver Mode active",
    intakeActiveBadge: "Pre-Consultation Intake Active",
    noticePrefix: "AI Intake Assistant:",
    noticeText: "Aarogya Mitra gathers your symptoms and medical history to brief the attending doctor. Final medical diagnosis and prescriptions are provided directly by your physician.",
    aiResponseLabel: "AI Pre-Consultation Assistant:",
    initialGreeting: "Good morning. I am your clinical intake assistant. Tell us what brings you here today — where does it hurt, and how long has it been?",
    capturedStatementLabel: "Captured Patient Statement:",
    micStandby: "○ Microphone Standby",
    micLive: "● Live Acoustic Stream",
    tapToSpeak: (langName) => `Tap to Speak in ${langName}`,
    doneSpeaking: "Done Speaking (Process Turn)",
    micListening: "Listening to your voice... Speak comfortably.",
    micHint: "Speak naturally in Hindi, Telugu, Tamil, Bengali, Marathi, Gujarati, Kannada, or English.",
    typePlaceholder: "Or type symptoms in any language...",
    quickRepliesTitle: "Quick Symptom Suggestions (Touch to Reply):",
    quickReplies: [
      "Severe chest tightness for 2 days",
      "High fever with chills and headache",
      "Sharp stomach pain after eating",
      "Persistent cough with shortness of breath"
    ],
    historicalContextTitle: "Longitudinal Historical Context:",
    historicalDisclaimer: "* Automatically aggregated from ABDM records for physician correlation.",
    readyForScannerTitle: "Ready to scan past prescriptions or lab slips?",
    readyForScannerSubtitle: "Attach physical medical documents or proceed directly to token generation",
    nextScanner: "Next: Scan Past Prescriptions",

    step3Badge: "Step 3 of 4",
    step3Title: "Scan Existing Prescriptions & Lab Slips",
    step3Subtitle: "Scanned paper records are extracted into verified historical evidence nodes on your clinical timeline.",
    backToVoice: "← Back to Spoken Voice",
    generateTokenBtn: "Generate Digital OPD Token & Storyboard",

    step4Badge: "First-Mile Intake Complete & Synced",
    step4Title: "Your Pre-Consultation Storyboard is Ready",
    step4Subtitle: "Present this digital token to the OPD consultation desk or open the Doctor Cockpit to inspect the evidence trail.",
    downloadPdf: "Download Official Clinical Intake Report (PDF)",
    openDoctorView: "Open Doctor Storyboard View",
    startAnotherIntake: "Start Another Intake"
  }
};

export function getKioskTranslation(langCode?: string): KioskTranslationStrings {
  const code = (langCode || "hi").toLowerCase().split("-")[0];
  return KIOSK_TRANSLATIONS[code] || KIOSK_TRANSLATIONS.hi;
}
