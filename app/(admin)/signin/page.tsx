'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';

export default function SignInPage({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  const { t } = useI18n<Copy>();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = new URLSearchParams({ email });
      await fetch('/api/auth/signin/email', { method: 'POST', body });
      window.location.href = '/admin/signin?sent=1';
    } finally {
      setSubmitting(false);
    }
  }

  if (searchParams.sent) {
    return (
      <main className="pt-32 px-6 max-w-md mx-auto text-center">
        <h1 className="headline text-3xl mb-4">{t.admin.signIn.checkEmailTitle}</h1>
        <p className="text-warmbrown">{t.admin.signIn.checkEmailBody}</p>
      </main>
    );
  }

  return (
    <main className="pt-32 px-6 max-w-md mx-auto">
      <h1 className="headline text-3xl mb-6 text-center">{t.admin.signIn.title}</h1>
      {searchParams.error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {t.admin.signIn.errors.generic}
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">{t.admin.signIn.emailLabel}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border border-tan px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? t.admin.signIn.submitting : t.admin.signIn.submit}
        </button>
      </form>
    </main>
  );
}
