import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '../types/game';
import { TranslationSchema } from './types';
import { translations } from './translations';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: TranslationSchema;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'tycoonbank_locale';

export function getInitialLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'de' || saved === 'en') {
    return saved;
  }
  if (typeof navigator !== 'undefined' && navigator.language && navigator.language.toLowerCase().startsWith('de')) {
    return 'de';
  }
  return 'en';
}

export const I18nProvider: React.FC<{ children: React.ReactNode; initialLocale?: Locale }> = ({
  children,
  initialLocale,
}) => {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale || getInitialLocale());

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore localstorage errors
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'de' ? 'en' : 'de');
  };

  useEffect(() => {
    if (initialLocale && initialLocale !== locale) {
      setLocaleState(initialLocale);
    }
  }, [initialLocale]);

  const value: I18nContextValue = {
    locale,
    setLocale,
    toggleLocale,
    t: translations[locale],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
