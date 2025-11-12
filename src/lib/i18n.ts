type Lang = 'en' | 'hi' | 'mr'

const translations: Record<Lang, Record<string, string>> = {
  en: {
    welcome: 'Welcome',
    logout: 'Logout',
    totalIssues: 'Total Issues',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    myIssues: 'My Issues',
    nearbyIssues: 'Nearby Issues',
    reportIssue: 'Report Issue',
    reportYourFirst: 'Report Your First Issue',
    noIssues: "No issues reported yet",
    captureLocation: 'Capture Location',
    getting: 'Getting...',
    submit: 'Report Issue',
  submitting: 'Submitting...',
  location: 'Location',
  photosOptional: 'Photos (Optional)',
  pleaseCaptureLocation: 'Please capture your location first',
  failedToGetLocation: 'Failed to get your location. Please enable location services.',
  failedReport: 'Failed to report issue. Please try again.',
    issueTitle: 'Issue Title',
    description: 'Description',
    category: 'Category',
    priorityInfo: 'Priority will be automatically calculated',
    successReported: 'Issue reported successfully!'
  },
  hi: {
    welcome: 'स्वागत है',
    logout: 'लॉग आउट',
    totalIssues: 'कुल समस्याएं',
    pending: 'लंबित',
    inProgress: 'प्रगति में',
    resolved: 'सुलझी हुई',
    myIssues: 'मेरी रिपोर्ट्स',
    nearbyIssues: 'आस-पास की रिपोर्ट्स',
    reportIssue: 'समस्या रिपोर्ट करें',
    reportYourFirst: 'अपनी पहली रिपोर्ट दर्ज करें',
    noIssues: 'अभी तक कोई रिपोर्ट नहीं',
    captureLocation: 'स्थान पकड़ें',
    getting: 'प्राप्त कर रहे हैं...',
    submit: 'रिपोर्ट सबमिट करें',
  submitting: 'सबमिट कर रहे हैं...',
  location: 'स्थान',
  photosOptional: 'फ़ोटो (वैकल्पिक)',
  pleaseCaptureLocation: 'कृपया पहले अपना स्थान पकड़ें',
  failedToGetLocation: 'आपका स्थान प्राप्त करने में विफल। कृपया स्थान सेवाएँ सक्षम करें।',
  failedReport: 'रिपोर्ट दर्ज करने में विफल। कृपया पुनः प्रयास करें।',
    issueTitle: 'समस्या का शीर्षक',
    description: 'विवरण',
    category: 'श्रेणी',
    priorityInfo: 'प्राथमिकता स्वतः निर्धारित की जाएगी',
    successReported: 'समस्या सफलतापूर्वक दर्ज की गई!'
  },
  mr: {
    welcome: 'स्वागत आहे',
    logout: 'लॉग आउट',
    totalIssues: 'एकूण समस्यां',
    pending: 'प्रलंबित',
    inProgress: 'प्रगतीमध्ये',
    resolved: 'सोलवल्या',
    myIssues: 'माझ्या रिपोर्ट्स',
    nearbyIssues: 'समीपच्या रिपोर्ट्स',
    reportIssue: 'समस्या नोंदवा',
    reportYourFirst: 'तुमची पहिली समस्या नोंदवा',
    noIssues: 'अद्याप कोणतीही समस्या नाही',
    captureLocation: 'स्थान मिळवा',
    getting: 'मिळवत आहोत...',
    submit: 'रिपोर्ट सबमिट करा',
  submitting: 'सबमिट करत आहोत...',
  location: 'स्थान',
  photosOptional: 'छायाचित्रे (ऐच्छिक)',
  pleaseCaptureLocation: 'कृपया प्रथम तुमचे स्थान मिळवा',
  failedToGetLocation: 'तुमचे स्थान मिळवण्यात अयशस्वी. कृपया स्थान सेवा सक्षम करा.',
  failedReport: 'रिपोर्ट नोंदवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    issueTitle: 'समस्येचे शीर्षक',
    description: 'वर्णन',
    category: 'वर्ग',
    priorityInfo: 'प्राथमिकता आपोआप ठरविली जाईल',
    successReported: 'समस्या यशस्वीरीत्या नोंदवली!' 
  }
}

export function useTranslation() {
  const defaultLang: Lang = (typeof window !== 'undefined' && (localStorage.getItem('lang') as Lang)) || 'en'

  const t = (key: string, lang?: Lang) => {
    const l = lang || (typeof window !== 'undefined' && (localStorage.getItem('lang') as Lang)) || defaultLang
    return translations[l]?.[key] || translations['en'][key] || key
  }

  const setLanguage = (lang: Lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang)
      // simple full reload to apply client translations across components
      window.location.reload()
    }
  }

  const getLanguage = (): Lang => {
    return (typeof window !== 'undefined' && (localStorage.getItem('lang') as Lang)) || defaultLang
  }

  return { t, setLanguage, getLanguage }
}
