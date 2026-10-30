import type { LegalProvision, StructuredAnswer } from "@/types/legal";
import { getSampleSource } from "./legal-sources";

interface CannedAnswer {
  id: string;
  keywords: string[];
  explanation: Record<string, string>;
  provisions: LegalProvision[];
  rights: StructuredAnswer["rights"];
  nextSteps: StructuredAnswer["nextSteps"];
  limitations: string[];
  sourceIds: string[];
  followUps: string[];
}

const commonLimitations = [
  "This is a sample answer written for demonstration. It is not based on a real law.",
  "Real rights depend on your exact facts, your contract and the law that applies where you live.",
];

export const cannedAnswers: CannedAnswer[] = [
  {
    id: "deposit",
    keywords: ["deposit", "landlord", "rent", "tenant", "evict", "vacate", "lease", "flat"],
    explanation: {
      en: "In this sample scenario, a landlord must return your security deposit within a fixed period after you move out, and may only deduct costs that are listed and lawful. If the deadline passes with no itemised list, you can ask for the deposit in writing first.",
      hi: "इस नमूना स्थिति में, मकान मालिक को आपके निकलने के बाद तय समय के भीतर सुरक्षा जमा राशि लौटानी होती है, और वह केवल सूचीबद्ध व वैध खर्च ही काट सकता है। यदि समय सीमा बीत जाए और कोई ब्योरा न मिले, तो पहले लिखित रूप में राशि मांगें।",
      te: "ఈ నమూనా సందర్భంలో, మీరు ఖాళీ చేసిన తర్వాత నిర్ణీత గడువులో యజమాని సెక్యూరిటీ డిపాజిట్‌ను తిరిగి ఇవ్వాలి, చట్టబద్ధమైన మరియు జాబితా చేసిన ఖర్చులను మాత్రమే మినహాయించవచ్చు. గడువు దాటి వివరాలు ఇవ్వకపోతే, ముందుగా లిఖితపూర్వకంగా డిపాజిట్ అడగండి.",
    },
    provisions: [
      { id: "p1", title: "Return of security deposit", summary: "Deposit returned within thirty days, less itemised deductions.", sourceId: "src-tenancy-4" },
      { id: "p2", title: "Notice before ending a tenancy", summary: "Written notice of at least sixty days for periodic tenancies.", sourceId: "src-tenancy-9" },
    ],
    rights: [
      { title: "Itemised deductions", detail: "You can ask for a written list of anything deducted from the deposit." },
      { title: "Written notice", detail: "A landlord ending a periodic tenancy should give written notice." },
    ],
    nextSteps: [
      { title: "Collect your paperwork", detail: "Gather the rental agreement, deposit receipt, and move-out photos or messages." },
      { title: "Send a written request", detail: "Ask for the deposit and an itemised list by a clear date. Keep a copy." },
      { title: "Consider free legal advice", detail: "If there is no reply, a legal aid service can explain your options." },
    ],
    limitations: commonLimitations,
    sourceIds: ["src-tenancy-4", "src-tenancy-9"],
    followUps: ["What if the landlord claims damage?", "Can I stay beyond the notice period?", "Draft a request for my deposit"],
  },
  {
    id: "employment",
    keywords: ["fired", "terminated", "terminate", "job", "employer", "salary", "wages", "notice period", "resign", "work"],
    explanation: {
      en: "In this sample scenario, an employer ending your job must follow the notice terms in your contract, and your earned wages are due within a fixed time after you leave. Check your contract for the notice period and any pay in lieu of notice.",
      hi: "इस नमूना स्थिति में, नौकरी समाप्त करने वाले नियोक्ता को आपके अनुबंध में लिखी नोटिस शर्तों का पालन करना होता है, और आपकी कमाई हुई मजदूरी छोड़ने के बाद तय समय में देय होती है। नोटिस अवधि और नोटिस के बदले वेतन के लिए अपना अनुबंध देखें।",
      te: "ఈ నమూనా సందర్భంలో, ఉద్యోగం ముగించే యజమాని మీ ఒప్పందంలోని నోటీసు నిబంధనలను పాటించాలి, మీరు సంపాదించిన వేతనం వెళ్ళిన తర్వాత నిర్ణీత గడువులో చెల్లించాలి. నోటీసు కాలం మరియు నోటీసుకు బదులుగా చెల్లింపు కోసం మీ ఒప్పందాన్ని చూడండి.",
    },
    provisions: [
      { id: "p1", title: "Termination notice", summary: "Written notice or pay in lieu, per contract and statutory minimum.", sourceId: "src-employment-7" },
      { id: "p2", title: "Final wages", summary: "Earned wages paid within a fixed period after separation.", sourceId: "src-employment-12" },
    ],
    rights: [
      { title: "Notice or pay in lieu", detail: "Termination normally comes with written notice or payment instead." },
      { title: "Earned wages", detail: "Wages for work already done remain payable." },
    ],
    nextSteps: [
      { title: "Read your contract", detail: "Find the notice period, probation terms and any reasons listed for termination." },
      { title: "Ask for the decision in writing", detail: "A written termination letter makes later steps easier." },
      { title: "Keep records", detail: "Save payslips, messages and your appointment letter." },
    ],
    limitations: commonLimitations,
    sourceIds: ["src-employment-7", "src-employment-12"],
    followUps: ["What if I was on probation?", "When should I get my final pay?", "How do I raise a complaint?"],
  },
  {
    id: "consumer",
    keywords: ["refund", "defective", "product", "purchase", "seller", "warranty", "consumer", "bought", "shop"],
    explanation: {
      en: "In this sample scenario, if something you bought is materially defective, you may ask the seller for a repair, replacement or refund. Start by contacting the seller in writing, then use the complaint forum if it is not resolved.",
      hi: "इस नमूना स्थिति में, यदि आपकी खरीदी वस्तु में गंभीर खराबी है, तो आप विक्रेता से मरम्मत, बदलाव या रिफंड मांग सकते हैं। पहले विक्रेता को लिखित में संपर्क करें, समाधान न मिले तो शिकायत मंच का उपयोग करें।",
      te: "ఈ నమూనా సందర్భంలో, మీరు కొన్న వస్తువులో తీవ్రమైన లోపం ఉంటే, విక్రేతను మరమ్మత్తు, మార్పిడి లేదా రిఫండ్ అడగవచ్చు. ముందుగా విక్రేతను లిఖితపూర్వకంగా సంప్రదించండి, పరిష్కారం కాకపోతే ఫిర్యాదు వేదికను ఉపయోగించండి.",
    },
    provisions: [
      { id: "p1", title: "Defective goods", summary: "Repair, replacement or refund for materially defective goods.", sourceId: "src-consumer-3" },
      { id: "p2", title: "Complaint forum", summary: "Written complaint within a limited period of the problem.", sourceId: "src-consumer-8" },
    ],
    rights: [
      { title: "Remedy for defects", detail: "You can ask for repair, replacement or refund." },
      { title: "Right to complain", detail: "A formal complaint route exists if the seller does not respond." },
    ],
    nextSteps: [
      { title: "Keep the evidence", detail: "Invoice, photos of the defect, warranty card and chat history." },
      { title: "Write to the seller", detail: "Describe the problem and the remedy you want, with a date to respond." },
      { title: "Note the time limit", detail: "Complaint forums usually have a deadline; check the real one for your area." },
    ],
    limitations: commonLimitations,
    sourceIds: ["src-consumer-3", "src-consumer-8"],
    followUps: ["What if there is no invoice?", "Is online shopping covered?", "Who do I complain to?"],
  },
  {
    id: "fallback",
    keywords: [],
    explanation: {
      en: "This is a sample reply. A real assistant would explain your situation in plain language and list the sources it used. Add a few details, such as what happened, when, and where you live, so the answer can be more specific.",
      hi: "यह एक नमूना उत्तर है। असली सहायक आपकी स्थिति को सरल भाषा में समझाएगा और उपयोग किए गए स्रोत बताएगा। क्या हुआ, कब हुआ और आप कहाँ रहते हैं, जैसी कुछ जानकारी जोड़ें ताकि उत्तर अधिक स्पष्ट हो।",
      te: "ఇది నమూనా సమాధానం. నిజమైన సహాయకుడు మీ పరిస్థితిని సులభ భాషలో వివరించి, ఉపయోగించిన మూలాలను చూపిస్తాడు. ఏమి జరిగింది, ఎప్పుడు, మీరు ఎక్కడ ఉంటారు వంటి వివరాలు జోడిస్తే సమాధానం మరింత స్పష్టంగా ఉంటుంది.",
    },
    provisions: [{ id: "p1", title: "Unfair contract terms", summary: "Terms that heavily favour one side may not be enforceable.", sourceId: "src-contract-2" }],
    rights: [{ title: "Ask for clarity", detail: "You can ask for any agreement or decision to be explained in writing." }],
    nextSteps: [
      { title: "Write down the facts", detail: "Dates, names, amounts and what was said or promised." },
      { title: "Keep every document", detail: "Contracts, receipts, notices, messages and photos." },
    ],
    limitations: commonLimitations,
    sourceIds: ["src-contract-2", "src-aid-1"],
    followUps: ["Can I get free legal help?", "What documents should I collect?"],
  },
];

export function pickCannedAnswer(question: string): CannedAnswer {
  const q = question.toLowerCase();
  return (
    cannedAnswers.find((a) => a.keywords.some((k) => q.includes(k))) ??
    cannedAnswers[cannedAnswers.length - 1]
  );
}

export function buildStructuredAnswer(question: string, language: string): StructuredAnswer {
  const canned = pickCannedAnswer(question);
  const hasLanguage = language in canned.explanation;
  return {
    status: "answered",
    simpleExplanation: canned.explanation[hasLanguage ? language : "en"],
    provisions: canned.provisions,
    rights: canned.rights,
    nextSteps: canned.nextSteps,
    limitations: canned.limitations,
    sources: canned.sourceIds.map(getSampleSource),
    followUps: canned.followUps,
    language: hasLanguage ? language : "en",
    languageFallback: !hasLanguage,
    origin: "sample",
  };
}
