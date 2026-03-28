import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "od", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
] as const;

export type LanguageCode = typeof LANGUAGES[number]["code"];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

import { translations } from "./translations";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as LanguageCode) || "en";
  });

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      
      let current: any = translations[language];
      for (const k of keys) {
        if (current === undefined) break;
        current = current[k];
      }

      if (current !== undefined && typeof current === 'string') {
        return current;
      }

      // Fallback to English
      let fallbackCurrent: any = translations["en"];
      for (const k of keys) {
        if (fallbackCurrent === undefined) break;
        fallbackCurrent = fallbackCurrent[k];
      }

      if (fallbackCurrent !== undefined && typeof fallbackCurrent === 'string') {
        return fallbackCurrent;
      }

      return key; // return key if not found
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
