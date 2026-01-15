export const LANGUAGES = {
  ENGLISH: "en",
  HINDI: "hi",
  MARATHI: "mr",
} as const

export type LanguageCode = (typeof LANGUAGES)[keyof typeof LANGUAGES]

export const languageNames: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिंदी (Hindi)",
  mr: "मराठी (Marathi)",
}

// Incident types for citizen chatbot
export const INCIDENT_TYPES = [
  "Theft",
  "Robbery",
  "Burglary",
  "Assault",
  "Domestic Violence",
  "Fraud",
  "Cybercrime",
  "Drug Offense",
  "Traffic Violation",
  "Vandalism",
  "Missing Person",
  "Rape",
  "Kidnap",
  "Child Marriage",
  "Other",
]

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // --- Police Chatbot ---
    greeting:
      "Hello! I'm your AI Assistant for filing police complaints. I'll help you register a First Information Report (FIR) by collecting all necessary details.\n\nThis process will take about 10-15 minutes. Are you ready to begin?",
    namePrompt: "What is your full name?",
    phonePrompt:
      "Thank you, {name}. What is your phone number? (Please provide a 10-digit number or with country code)",
    addressPrompt: "What is your complete address? (Include street, area, city, state, and zip code)",
    fatherHusbandPrompt: "What is your father's or husband's name? (If not applicable, you can type 'N/A')",
    dobPrompt: "What is your date of birth? (Format: YYYY-MM-DD or you can type 'N/A')",
    nationalityPrompt: "What is your nationality?",
    occupationPrompt: "What is your occupation?",
    districtPrompt: "Now let's collect incident location details. What is the district where this incident occurred?",
    psPrompt: "Which Police Station has jurisdiction over this area? (Enter the police station name)",
    beatPrompt: "What is the beat number? (If you don't know, type 'Unknown')",
    directionPrompt: "What is the direction and distance from the police station? (e.g., '2 km North' or 'Unknown')",
    incidentTypePrompt: "What type of incident would you like to report?",
    locationPrompt: "Where did this incident occur? Please provide the specific location details.",
    dateTimePrompt:
      "When did this incident occur? Please provide the date and time (e.g., 'January 15, 2024 at 3:30 PM' or 'yesterday evening').",
    informationTypePrompt: "Is this information being reported in written form or orally?\n\n1. Written\n2. Oral",
    descriptionPrompt:
      "Please provide a detailed description of what happened. Include as much relevant information as possible. (At least 20 characters)",
    reasonForDelayPrompt:
      "Was there any delay in reporting this incident? If yes, please explain the reason. (If no delay, type 'No delay')",
    propertiesPrompt: "Were any properties involved or stolen? If yes, please list them. (If no, type 'None')",
    priorityPrompt:
      "How would you rate the priority of this incident?\n\n1. Low - Minor issues, no immediate danger\n2. Medium - Moderate concern, needs attention\n3. High - Serious matter, requires prompt action\n4. Critical - Emergency, immediate response needed",
    confirmationPrompt: "Please review your FIR details:",
    successMessage: "✅ Perfect! Your complaint has been recorded and will be processed shortly.",
    downloadMessage: "You can now download your FIR PDF using the download button at the top.",
    errorMessage: "Something went wrong. Please try again.",
    invalidInput: "Please provide a valid input.",
    complaintSubmitted: "Your complaint has already been submitted.",
    startOver: "No problem! Let's start over.",

    // --- Citizen Chatbot ---
    citizenGreeting:
      "Welcome to the Citizen e-FIR Chatbot!\nPlease select your preferred language:\n1. English\n2. Hindi\n3. Marathi",
    citizenSelectLanguage: "Please select your language:\n1. English\n2. हिंदी (Hindi)\n3. मराठी (Marathi)",
    citizenName: "May I know your full name?",
    citizenPhone: "Please provide your phone number.",
    citizenAddress: "Please provide your complete address.",
    citizenFatherHusband: "What is your father's or husband's name? (If not applicable, type 'N/A')",
    citizenDOB: "Enter your date of birth (DD/MM/YYYY).",
    citizenNationality: "What is your nationality?",
    citizenOccupation: "What is your occupation?",
    citizenDistrict: "Enter your district.",
    citizenIncidentType: `Select the type of incident:\n${INCIDENT_TYPES.map((t, i) => `${i+1}. ${t}`).join("\n")}`,
    citizenPriority: "Enter the priority of the incident: High, Medium, Low.",
    citizenDescribeIncident: "Please describe what happened:",
    citizenProvideMoreDetails: "Please provide more details.",
    citizenSelectDateTime: "Select date & time of incident:",
    citizenEnterLocation: "Enter incident location:",
    citizenVictimDetails: "Provide victim details (if any):",
    citizenEvidenceUpload: "Upload any evidence (images, documents, if any):",
    citizenConfirmation: `Thank you. Your e-FIR request has been created.
Please visit the nearest police station within 3 days to verify.`,
    citizenAlreadySubmitted: "Your e-FIR request has already been submitted.",
    citizenInvalidStep: "Invalid step. Please restart the chat.",
  },

  hi: {
    // --- Police Chatbot ---
    greeting:
      "नमस्ते! मैं आपके पुलिस शिकायतों के लिए AI सहायक हूँ। मैं आपको First Information Report (FIR) दर्ज करने में मदद करूंगा।\n\nयह प्रक्रिया लगभग 10-15 मिनट लेगी। क्या आप शुरू करने के लिए तैयार हैं?",
    namePrompt: "आपका पूरा नाम क्या है?",
    phonePrompt: "धन्यवाद, {name}। आपका फोन नंबर क्या है? (कृपया 10 अंकों की संख्या प्रदान करें)",
    addressPrompt: "आपका पूरा पता क्या है? (सड़क, क्षेत्र, शहर, राज्य और पिन कोड शामिल करें)",
    fatherHusbandPrompt: "आपके पिता या पति का नाम क्या है? (यदि लागू नहीं है, तो 'N/A' टाइप करें)",
    dobPrompt: "आपकी जन्मतिथि क्या है? (प्रारूप: YYYY-MM-DD या आप 'N/A' टाइप कर सकते हैं)",
    nationalityPrompt: "आपकी राष्ट्रीयता क्या है?",
    occupationPrompt: "आपका व्यवसाय क्या है?",
    districtPrompt: "अब घटना के स्थान की जानकारी एकत्र करते हैं। यह घटना किस जिले में हुई?",
    psPrompt: "इस क्षेत्र में किस पुलिस स्टेशन का अधिकार है? (पुलिस स्टेशन का नाम दर्ज करें)",
    beatPrompt: "बीट नंबर क्या है? (यदि आप नहीं जानते, तो 'Unknown' टाइप करें)",
    directionPrompt: "पुलिस स्टेशन से दिशा और दूरी क्या है? (जैसे '2 किमी उत्तर')",
    incidentTypePrompt: "आप किस प्रकार की घटना की रिपोर्ट करना चाहते हैं?",
    locationPrompt: "यह घटना कहाँ हुई? कृपया विशिष्ट स्थान विवरण प्रदान करें:",
    dateTimePrompt: "यह घटना कब हुई? कृपया तारीख और समय प्रदान करें:",
    informationTypePrompt: "क्या यह जानकारी लिखित रूप में या मौखिक रूप से दी जा रही है?\n\n1. लिखित\n2. मौखिक",
    descriptionPrompt: "कृपया विस्तार से बताएं कि क्या हुआ। (कम से कम 20 वर्ण)",
    reasonForDelayPrompt: "क्या रिपोर्ट करने में कोई देरी हुई? यदि हाँ, तो कारण बताएं।",
    propertiesPrompt: "क्या कोई संपत्ति शामिल थी या चोरी हुई? यदि हाँ, तो सूची बनाएं।",
    priorityPrompt: "आप इस घटना की प्राथमिकता कैसे आंकेंगे?\n\n1. कम\n2. मध्यम\n3. अधिक\n4. जरूरी",
    confirmationPrompt: "कृपया अपने FIR विवरण की समीक्षा करें:",
    successMessage: "✅ बहुत अच्छा! आपकी शिकायत दर्ज हो गई है।",
    downloadMessage: "आप अब 'डाउनलोड करें' बटन का उपयोग करके FIR PDF डाउनलोड कर सकते हैं।",
    errorMessage: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
    invalidInput: "कृपया मान्य इनपुट प्रदान करें।",
    complaintSubmitted: "आपकी शिकायत पहले ही दर्ज हो चुकी है।",
    startOver: "कोई समस्या नहीं! आइए फिर से शुरू करें।",

    // --- Citizen Chatbot ---
    citizenGreeting:
      "नागरिक ई-एफआईआर चैटबोट में आपका स्वागत है!\nकृपया अपनी पसंदीदा भाषा चुनें:\n1. अंग्रेज़ी\n2. हिंदी\n3. मराठी",
    citizenSelectLanguage: "कृपया 1, 2 या 3 चुनें",
    citizenName: "आपका पूरा नाम क्या है?",
    citizenPhone: "कृपया अपना फोन नंबर दें।",
    citizenAddress: "कृपया अपना पूरा पता दें।",
    citizenFatherHusband: "आपके पिता या पति का नाम क्या है? (यदि लागू नहीं हो तो 'N/A' टाइप करें)",
    citizenDOB: "अपनी जन्मतिथि दर्ज करें (DD/MM/YYYY)।",
    citizenNationality: "आपकी राष्ट्रीयता क्या है?",
    citizenOccupation: "आपका व्यवसाय क्या है?",
    citizenDistrict: "जिला दर्ज करें।",
    citizenIncidentType: `घटना का प्रकार चुनें:\n${INCIDENT_TYPES.map((t, i) => `${i+1}. ${t}`).join("\n")}`,
    citizenPriority: "घटना की प्राथमिकता दर्ज करें: High, Medium, Low.",
    citizenDescribeIncident: "कृपया बताएं कि क्या हुआ:",
    citizenProvideMoreDetails: "कृपया अधिक विवरण दें।",
    citizenSelectDateTime: "घटना की तिथि और समय चुनें:",
    citizenEnterLocation: "घटना का स्थान दर्ज करें:",
    citizenVictimDetails: "पीड़ित का विवरण दें (यदि कोई हो):",
    citizenEvidenceUpload: "कोई सबूत अपलोड करें (चित्र, दस्तावेज़, यदि कोई हो):",
    citizenConfirmation: `धन्यवाद। आपकी ई-एफआईआर अनुरोध सफलतापूर्वक बनाई गई है।
कृपया सत्यापन के लिए 3 दिनों के भीतर नजदीकी पुलिस स्टेशन जाएं।`,
    citizenAlreadySubmitted: "आपका ई-एफआईआर अनुरोध पहले ही जमा किया जा चुका है।",
    citizenInvalidStep: "अमान्य चरण। कृपया चैट को पुनः प्रारंभ करें।",
  },

  mr: {
    // --- Police Chatbot ---
    greeting:
      "नमस्कार! मी पोलिस तक्रारीसाठी आपका AI सहायक आहे। मी आपल्याला First Information Report (FIR) दाखल करण्यात मदत करीन।\n\nही प्रक्रिया सुमारे 10-15 मिनिटे लागेल. तुम्ही सुरू करण्यासाठी तयार आहात?",
    namePrompt: "आपले पूर्ण नाव काय आहे?",
    phonePrompt: "धन्यवाद, {name}. आपला फोन नंबर काय आहे?",
    addressPrompt: "आपला संपूर्ण पत्ता काय आहे?",
    fatherHusbandPrompt: "आपले वडील किंवा पति यांचे नाव काय आहे?",
    dobPrompt: "आपली जन्मतारीख काय आहे?",
    nationalityPrompt: "आपली राष्ट्रीयता काय आहे?",
    occupationPrompt: "आपला व्यवसाय काय आहे?",
    districtPrompt: "या घटनेचा जिल्हा कोणता आहे?",
    psPrompt: "कोणते पोलिस स्टेशन या क्षेत्रात अधिकार रखते?",
    beatPrompt: "बीट क्रमांक काय आहे?",
    directionPrompt: "पोलिस स्टेशन पासून दिशा आणि अंतर काय आहे?",
    incidentTypePrompt: "आप कोणत्या प्रकारच्या घटनेची तक्रार करू इच्छिता?",
    locationPrompt: "ही घटना कोठे घडली? विशिष्ट स्थान तपशील प्रदान करा.",
    dateTimePrompt: "ही घटना कधी घडली?",
    informationTypePrompt: "हिही माहिती लिखित किंवा मौखिक स्वरूपात दिली जात आहे?\n\n1. लिखित\n2. मौखिक",
    descriptionPrompt: "कृपया विस्तारपूर्वक काय घडले याचे वर्णन करा.",
    reasonForDelayPrompt: "रिपोर्ट करण्यात काही विलंब झाला का?",
    propertiesPrompt: "कोणत्या मालमत्तेचा समावेश होता किंवा चोरी झाली?",
    priorityPrompt: "आप या घटनेची प्राधान्यता कसे रेट करता?\n\n1. कम\n2. मध्यम\n3. उच्च\n4. गंभीर",
    confirmationPrompt: "कृपया आपले FIR तपशील पुनरावलोकन करा:",
    successMessage: "✅ उत्तम! आपली तक्रार दाखल झाली आहे.",
    downloadMessage: "तुम्ही आता 'डाउनलोड करा' बटण वापरून FIR PDF डाउनलोड करू शकता.",
    errorMessage: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
    invalidInput: "कृपया वैध इनपुट प्रदान करा.",
    complaintSubmitted: "आपली तक्रार आधीच दाखल झाली आहे.",
    startOver: "कोणतीही समस्या नाही! पुन्हा सुरू करूया.",

    // --- Citizen Chatbot ---
    citizenGreeting:
      "नागरिक ई-एफआयआर चॅटबॉटमध्ये आपले स्वागत आहे!\nकृपया आपली पसंतीची भाषा निवडा:\n1. इंग्रजी\n2. हिंदी\n3. मराठी",
    citizenSelectLanguage: "कृपया 1, 2 किंवा 3 निवडा",
    citizenName: "आपले पूर्ण नाव काय आहे?",
    citizenPhone: "कृपया आपला फोन नंबर द्या.",
    citizenAddress: "कृपया आपला संपूर्ण पत्ता द्या.",
    citizenFatherHusband: "आपले वडील किंवा पति यांचे नाव काय आहे? (जर लागू नसेल तर 'N/A')",
    citizenDOB: "आपली जन्मतारीख प्रविष्ट करा (DD/MM/YYYY).",
    citizenNationality: "आपली राष्ट्रीयता काय आहे?",
    citizenOccupation: "आपला व्यवसाय काय आहे?",
    citizenDistrict: "जिला प्रविष्ट करा.",
    citizenIncidentType: `घटना प्रकार निवडा:\n${INCIDENT_TYPES.map((t, i) => `${i+1}. ${t}`).join("\n")}`,
    citizenPriority: "घटना प्राधान्यता प्रविष्ट करा: High, Medium, Low.",
    citizenDescribeIncident: "कृपया काय घडलं ते सांगा:",
    citizenProvideMoreDetails: "कृपया अधिक तपशील द्या.",
    citizenSelectDateTime: "घटनेची तारीख आणि वेळ निवडा:",
    citizenEnterLocation: "घटनेचे स्थान प्रविष्ट करा:",
    citizenVictimDetails: "पीडिताचा तपशील द्या (जर असेल तर):",
    citizenEvidenceUpload: "कोणताही पुरावा अपलोड करा (चित्रे, कागदपत्रे, असल्यास):",
    citizenConfirmation: `धन्यवाद. तुमची ई-एफआयआर विनंती यशस्वीरित्या तयार केली गेली आहे.
कृपया पडताळणीसाठी 3 दिवसांच्या आत जवळच्या पोलिस स्टेशनला भेट द्या.`,
    citizenAlreadySubmitted: "तुमची ई-एफआयआर विनंती आधीच सबमिट झाली आहे.",
    citizenInvalidStep: "अवैध पायरी. कृपया चॅट पुन्हा सुरू करा।",
  },
}

export const getTranslation = (
  key: string,
  language: LanguageCode,
  variables?: Record<string, string>
): string => {
  let text = translations[language]?.[key] || translations.en[key] || key

  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(`{${varKey}}`, value)
    })
  }

  return text
}
