'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

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

interface ProviderProps<T extends I18nPack> {
  packs: T;
  initial?: Lang;
  children: ReactNode;
}

export function I18nProvider<T extends I18nPack>({ packs, initial = 'en', children }: ProviderProps<T>) {
  const [lang, setLang] = useState<Lang>(initial);
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
