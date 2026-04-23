import Link from 'next/link';
import { LanguageToggle } from '@/ui';
import { signOut } from '@/server/auth';
import { copyEn } from '@/content/kiki';

export function AdminHeader({ email }: { email: string; lang?: 'en' | 'zh' }) {
  const t = copyEn;
  async function doSignOut() {
    'use server';
    await signOut({ redirectTo: '/' });
  }
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-tan bg-cream">
      <Link href="/admin" className="headline text-xl">
        {t.admin.header.brand}
      </Link>
      <div className="flex items-center gap-4">
        <LanguageToggle />
        <span className="text-sm text-warmbrown">
          {t.admin.header.signedInAs} <strong>{email}</strong>
        </span>
        <form action={doSignOut}>
          <button
            type="submit"
            className="inline-flex items-center justify-center font-sans text-xs font-semibold uppercase tracking-wider px-4 py-2 min-h-[44px] border border-current rounded-full transition-colors hover:bg-warmbrown hover:text-cream"
          >
            {t.admin.header.signOut}
          </button>
        </form>
      </div>
    </header>
  );
}
