import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { copyEn } from '@/content/kiki/copy.en';
import { copyZh } from '@/content/kiki/copy.zh';
import type { Copy } from '@/content/kiki/copy.en';

const packs = { en: copyEn, zh: copyZh };

function Probe() {
  const { lang, setLang, t } = useI18n<Copy>();
  return (
    <>
      <span data-testid="lang">{lang}</span>
      <span data-testid="hero">{t.landing.heroHeadline}</span>
      <button data-testid="lang-switch-zh" onClick={() => setLang('zh')}>zh</button>
    </>
  );
}

describe('i18n', () => {
  afterEach(() => cleanup());

  it('defaults to english and renders copy', () => {
    render(<I18nProvider packs={packs} initial="en"><Probe /></I18nProvider>);
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('hero').textContent).toMatch(/Korean-style/);
  });

  it('switches to chinese when setLang is called', () => {
    render(<I18nProvider packs={packs} initial="en"><Probe /></I18nProvider>);
    fireEvent.click(screen.getAllByTestId('lang-switch-zh')[0]);
    expect(screen.getByTestId('lang').textContent).toBe('zh');
    expect(screen.getByTestId('hero').textContent).toMatch(/韩式/);
  });
});
