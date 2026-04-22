'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'zh';

export interface I18nPack {
  en: unknown;
  zh: unknown;
}

interface I18nValue<T> {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: T;
}

const I18nContext = createContext<I18nValue<unknown> | null>(null);

const STORAGE_KEY = 'kiki.lang';

interface ProviderProps<T extends I18nPack> {
  packs: T;
  initial?: Lang;
  children: ReactNode;
}

export function I18nProvider<T extends I18nPack>({ packs, initial = 'en', children }: ProviderProps<T>) {
  const [lang, setLangState] = useState<Lang>(initial);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'zh') setLangState(stored);
    } catch {
      // localStorage unavailable (private mode, SSR mismatch)
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable
    }
  };

  const t = lang === 'en' ? packs.en : packs.zh;
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n<T = unknown>(): I18nValue<T> {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx as I18nValue<T>;
}
