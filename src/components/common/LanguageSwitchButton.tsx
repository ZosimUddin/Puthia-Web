import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageSwitchButton: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-black transition-all cursor-pointer shadow-xs"
      aria-label="ভাষা পরিবর্তন করুন (Switch Language)"
      title="বাংলা / English ভাষা পরিবর্তন"
    >
      <Globe size={15} className="text-emerald-600" />
      <span>{t('languageToggle')}</span>
    </button>
  );
};
