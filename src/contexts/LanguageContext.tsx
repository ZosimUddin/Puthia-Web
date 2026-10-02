import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../constants/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.bn) => string;
  getLocalizedField: (bnVal?: string, enVal?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bn');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang === 'en' || savedLang === 'bn') {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang: Language = language === 'bn' ? 'en' : 'bn';
    setLanguage(nextLang);
    localStorage.setItem('app_language', nextLang);
  };

  const t = (key: keyof typeof translations.bn): string => {
    return translations[language][key] || translations['bn'][key] || key;
  };

  /**
   * Helper to fetch multi-lingual data fields from Firestore/Database
   */
  const getLocalizedField = (bnVal?: string, enVal?: string): string => {
    if (language === 'en') {
      return enVal || bnVal || '';
    }
    return bnVal || enVal || '';
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      t,
      getLocalizedField
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
