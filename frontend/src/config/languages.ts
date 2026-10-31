export interface Language {
  code: string;
  name: string;
  native: string;
}

/** Languages offered for responses. The live assistant tried Hindi, Telugu and Hinglish on 2026-10-31; the rest are untested. */
export const languages: Language[] = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "hinglish", name: "Hinglish", native: "Hinglish (Roman)" },
];

export function getLanguage(code: string): Language {
  return languages.find((l) => l.code === code) ?? languages[0];
}
