"""Fixed, user-facing assistant text per reply language. Falls back to English for languages without a translation.

The Hindi, Telugu and Hinglish strings were written by the model that wrote this code and have not been reviewed
by a native speaker (KNOWN_ISSUES #55). Keep them short and literal.
"""

_LIMITATIONS = {
    "en": [
        "This answer was written by an AI model and has not been checked against official legal texts.",
        "It is general information, not legal advice. Real rights depend on your facts, your documents and the law where you live.",
    ],
    "hi": [
        "यह उत्तर एक AI मॉडल ने लिखा है और इसे आधिकारिक कानूनी पाठ से मिलाकर जाँचा नहीं गया है।",
        "यह सामान्य जानकारी है, कानूनी सलाह नहीं। आपके असली अधिकार आपके तथ्यों, आपके दस्तावेज़ों और आपके यहाँ के कानून पर निर्भर करते हैं।",
    ],
    "te": [
        "ఈ సమాధానాన్ని AI మోడల్ రాసింది, దీనిని అధికారిక చట్ట పాఠాలతో సరిచూడలేదు.",
        "ఇది సాధారణ సమాచారం మాత్రమే, న్యాయ సలహా కాదు. మీ నిజమైన హక్కులు మీ పరిస్థితి, మీ పత్రాలు మరియు మీ ప్రాంతంలోని చట్టంపై ఆధారపడి ఉంటాయి.",
    ],
    "hinglish": [
        "Yeh jawab ek AI model ne likha hai aur ise official kanooni text se milakar check nahi kiya gaya hai.",
        "Yeh general jaankari hai, kanooni salah nahi. Aapke asli adhikaar aapke tathyon, aapke documents aur aapke yahan ke kanoon par depend karte hain.",
    ],
}

_REMOVED = {
    "en": "{n} detail(s) in the AI's answer were removed because they cited laws, cases, numbers, deadlines or guarantees that Aequa cannot verify. Check the official source for specifics.",
    "hi": "AI के उत्तर के {n} अंश हटा दिए गए क्योंकि उनमें ऐसे कानून, मामले, संख्याएँ, समय-सीमाएँ या गारंटी थीं जिनकी Aequa पुष्टि नहीं कर सकता। विशेष जानकारी के लिए आधिकारिक स्रोत देखें।",
    "te": "AI సమాధానంలోని {n} భాగాలు తొలగించబడ్డాయి, ఎందుకంటే వాటిలో Aequa నిర్ధారించలేని చట్టాలు, కేసులు, సంఖ్యలు, గడువులు లేదా హామీలు ఉన్నాయి. వివరాల కోసం అధికారిక మూలాన్ని చూడండి.",
    "hinglish": "AI ke jawab ke {n} hisse hata diye gaye kyunki unmein aise kanoon, cases, numbers, deadlines ya guarantee the jinhe Aequa verify nahi kar sakta. Details ke liye official source dekhein.",
}

_ABSTAIN = {
    "en": "I can't give a reliable answer to this without checked legal sources. For exact sections, deadlines or amounts, please use the official source or free legal aid (NALSA helpline 15100).",
    "hi": "जाँचे हुए कानूनी स्रोतों के बिना मैं इसका भरोसेमंद उत्तर नहीं दे सकता। सटीक धाराओं, समय-सीमाओं या रकम के लिए कृपया आधिकारिक स्रोत या मुफ़्त कानूनी सहायता (NALSA हेल्पलाइन 15100) देखें।",
    "te": "తనిఖీ చేసిన చట్ట మూలాలు లేకుండా దీనికి నమ్మదగిన సమాధానం ఇవ్వలేను. ఖచ్చితమైన సెక్షన్లు, గడువులు లేదా మొత్తాల కోసం అధికారిక మూలాన్ని లేదా ఉచిత న్యాయ సహాయాన్ని (NALSA హెల్ప్‌లైన్ 15100) చూడండి.",
    "hinglish": "Checked kanooni sources ke bina main iska bharosemand jawab nahi de sakta. Exact sections, deadlines ya amounts ke liye official source ya free legal aid (NALSA helpline 15100) dekhein.",
}

_BLOCKED = {
    "en": "I couldn't produce a safe answer to that. Please rephrase your question about your situation.",
    "hi": "मैं इसका सुरक्षित उत्तर नहीं दे सका। कृपया अपनी स्थिति के बारे में अपना सवाल दोबारा लिखें।",
    "te": "దీనికి సురక్షితమైన సమాధానం ఇవ్వలేకపోయాను. దయచేసి మీ పరిస్థితి గురించి ప్రశ్నను మళ్లీ రాయండి.",
    "hinglish": "Main iska safe jawab nahi de saka. Kripya apni sthiti ke baare mein sawaal dobara likhiye.",
}


def limitations(language: str) -> list[str]:
    return list(_LIMITATIONS.get(language, _LIMITATIONS["en"]))


def removed_note(language: str, count: int) -> str:
    return _REMOVED.get(language, _REMOVED["en"]).format(n=count)


def abstain_text(language: str) -> str:
    return _ABSTAIN.get(language, _ABSTAIN["en"])


def blocked_text(language: str) -> str:
    return _BLOCKED.get(language, _BLOCKED["en"])
