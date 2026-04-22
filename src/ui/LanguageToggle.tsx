'use client';

import { useI18n } from '@/lib/i18n';

export interface LanguageToggleProps {
  className?: string;
  labelEn?: string;
  labelZh?: string;
  ariaLabel?: string;
}

export function LanguageToggle({
  className = '',
  labelEn = 'EN',
  labelZh = '中文',
  ariaLabel = 'Switch language',
}: LanguageToggleProps) {
  const { lang, setLang } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
      aria-label={ariaLabel}
      className={`font-sans text-xs font-semibold uppercase tracking-wider border border-current px-4 py-2 min-h-[44px] min-w-[44px] ${className}`}
    >
      {lang === 'zh' ? labelEn : labelZh}
    </button>
  );
}
