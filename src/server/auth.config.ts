import type { NextAuthConfig } from 'next-auth';

export function isAllowlisted(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  const list = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(normalized);
}

export const authConfig: NextAuthConfig = {
  session: { strategy: 'database' },
  pages: {
    signIn: '/admin/signin',
    verifyRequest: '/admin/signin?sent=1',
    error: '/admin/signin?error=1',
  },
  providers: [], // Providers are attached in the Node-runtime `auth.ts`
  callbacks: {
    async signIn({ user }) {
      return isAllowlisted(user?.email);
    },
  },
};
