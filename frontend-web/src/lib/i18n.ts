export type Language = "en" | "ta" | "hi" | "te" | "kn";

export interface Translations {
  walletBalance: string;
  topUp: string;
  aiCopilotActive: string;
  searchPlaceholder: string;
  signOut: string;
  gstRegistration: string;
  gstrFiling: string;
  itrOptimizer: string;
  panCard: string;
  passportSeva: string;
  dynamicCerts: string;
  r2Vault: string;
  printReceipt: string;
  whatsappReceipt: string;
  recentFilings: string;
  todaysEarnedMargin: string;
  admin: string;
  distributor: string;
  retailer: string;
  operator: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    walletBalance: "Wallet Balance",
    topUp: "Top Up",
    aiCopilotActive: "AI Copilot Active",
    searchPlaceholder: "Search services, GSTIN, PAN...",
    signOut: "Sign Out",
    gstRegistration: "GST Registration Hub",
    gstrFiling: "GSTR-1 & 3B (AI ITC Match)",
    itrOptimizer: "Form 16 AI ITR Optimizer",
    panCard: "PAN Card (49A / Reprint)",
    passportSeva: "Passport Seva Suvidha",
    dynamicCerts: "Dynamic E-Certificates",
    r2Vault: "Cloudflare R2 Vault",
    printReceipt: "Print Receipt",
    whatsappReceipt: "Send WhatsApp",
    recentFilings: "Recent Counter Filings & Receipts",
    todaysEarnedMargin: "Today's Earned Margin",
    admin: "Admin",
    distributor: "Distributor",
    retailer: "Retailer",
    operator: "Operator",
  },
  ta: {
    walletBalance: "பணப்பை இருப்பு",
    topUp: "ரீசார்ஜ்",
    aiCopilotActive: "AI வழிகாட்டி தயார்",
    searchPlaceholder: "சேவைகள், ஜிஎஸ்டி, பான் தேடுக...",
    signOut: "வெளியேறு",
    gstRegistration: "ஜிஎஸ்டி பதிவு மையம்",
    gstrFiling: "GSTR-1 & 3B தாக்கல்",
    itrOptimizer: "படிவம் 16 AI வருமான வரி",
    panCard: "பான் கார்டு (படிவம் 49A)",
    passportSeva: "பாஸ்போர்ட் சேவை",
    dynamicCerts: "டிஜிட்டல் சான்றிதழ்கள்",
    r2Vault: "R2 பாதுகாப்பகம்",
    printReceipt: "ரசீது அச்சிடு",
    whatsappReceipt: "வாட்ஸ்அப் அனுப்பு",
    recentFilings: "சமீபத்திய தாக்கல்கள் மற்றும் ரசீதுகள்",
    todaysEarnedMargin: "இன்றைய ஈட்டிய வருமானம்",
    admin: "நிர்வாகி",
    distributor: "விநியோகஸ்தர்",
    retailer: "சில்லறை விற்பனையாளர்",
    operator: "ஆபரேட்டர்",
  },
  hi: {
    walletBalance: "वॉलेट शेष",
    topUp: "टॉप अप",
    aiCopilotActive: "AI सहायक सक्रिय",
    searchPlaceholder: "सेवाएं, जीएसटी, पैन खोजें...",
    signOut: "साइन आउट",
    gstRegistration: "जीएसटी पंजीकरण केंद्र",
    gstrFiling: "जीएसटीआर-1 और 3बी फाइलिंग",
    itrOptimizer: "फॉर्म 16 AI इनकम टैक्स",
    panCard: "पैन कार्ड (फॉर्म 49A)",
    passportSeva: "पासपोर्ट सेवा सुविधा",
    dynamicCerts: "डिजिटल प्रमाण पत्र",
    r2Vault: "R2 दस्तावेज़ वॉल्ट",
    printReceipt: "रसीद प्रिंट करें",
    whatsappReceipt: "व्हाट्सएप भेजें",
    recentFilings: "हाल की फाइलिंग और रसीदें",
    todaysEarnedMargin: "आज का अर्जित मार्जिन",
    admin: "एडमिन",
    distributor: "वितरक",
    retailer: "रिटेलर",
    operator: "ऑपरेटर",
  },
  te: {
    walletBalance: "వాలెట్ బ్యాలెన్స్",
    topUp: "టాప్ అప్",
    aiCopilotActive: "AI అసిస్టెంట్ సిద్ధం",
    searchPlaceholder: "సేవలు, GSTIN, PAN వెతకండి...",
    signOut: "లాగ్ అవుట్",
    gstRegistration: "జీఎస్టీ నమోదు కేంద్రం",
    gstrFiling: "GSTR-1 & 3B ఫైలింగ్",
    itrOptimizer: "ఫారమ్ 16 AI ఆదాయపు పన్ను",
    panCard: "పాన్ కార్డ్ (ఫారమ్ 49A)",
    passportSeva: "పాస్‌పోర్ట్ సేవా కేంద్రం",
    dynamicCerts: "డిజిటల్ సర్టిఫికెట్లు",
    r2Vault: "R2 డాక్యుమెంట్ వాల్ట్",
    printReceipt: "రశీదు ముద్రించండి",
    whatsappReceipt: "వాట్సాప్ పంపండి",
    recentFilings: "ఇటీవలి ఫైలింగ్‌లు & రసీదులు",
    todaysEarnedMargin: "నేటి సంపాదించిన మార్జిన్",
    admin: "అడ్మిన్",
    distributor: "డిస్ట్రిబ్యూటర్",
    retailer: "రిటైలర్",
    operator: "ఆపరేటర్",
  },
  kn: {
    walletBalance: "ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್",
    topUp: "ಟಾಪ್ ಅಪ್",
    aiCopilotActive: "AI ಸಹಾಯಕ ಸಕ್ರಿಯ",
    searchPlaceholder: "ಸೇವೆಗಳು, ಜಿಎಸ್ಟಿ, ಪ್ಯಾನ್ ಹುಡುಕಿ...",
    signOut: "ಸೈನ್ ಔಟ್",
    gstRegistration: "ಜಿಎಸ್ಟಿ ನೋಂದಣಿ ಕೇಂದ್ರ",
    gstrFiling: "GSTR-1 & 3B ಫೈಲಿಂಗ್",
    itrOptimizer: "ಫಾರ್ಮ್ 16 AI ಆದಾಯ ತೆರಿಗೆ",
    panCard: "ಪ್ಯಾನ್ ಕಾರ್ಡ್ (ಫಾರ್ಮ್ 49A)",
    passportSeva: "ಪಾಸ್ಪೋರ್ಟ್ ಸೇವಾ ಕೇಂದ್ರ",
    dynamicCerts: "ಡಿಜಿಟಲ್ ಪ್ರಮಾಣಪತ್ರಗಳು",
    r2Vault: "R2 ಡಾಕ್ಯುಮೆಂಟ್ ವಾಲ್ಟ್",
    printReceipt: "ರಶೀದಿ ಮುದ್ರಿಸಿ",
    whatsappReceipt: "ವಾಟ್ಸಾಪ್ ಕಳುಹಿಸಿ",
    recentFilings: "ಇತ್ತೀಚಿನ ಫೈಲಿಂಗ್‌ಗಳು ಮತ್ತು ರಶೀದಿಗಳು",
    todaysEarnedMargin: "ಇಂದಿನ ಗಳಿಸಿದ ಮಾರ್ಜಿನ್",
    admin: "ಅಡ್ಮಿನ್",
    distributor: "ವಿತರಕ",
    retailer: "ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿ",
    operator: "ಆಪರೇಟರ್",
  },
};

export const languageNames: Record<Language, string> = {
  en: "English",
  ta: "தமிழ் (Tamil)",
  hi: "हिन्दी (Hindi)",
  te: "తెలుగు (Telugu)",
  kn: "ಕನ್ನಡ (Kannada)",
};
