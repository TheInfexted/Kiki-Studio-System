import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { sendMagicLinkEmail } from '@/modules/notifications';
import { createRateLimiter } from '@/lib/rate-limit';
import { authConfig, isAllowlisted } from '@/server/auth.config';

export { isAllowlisted };

const signInLimiter = createRateLimiter({ max: 5, windowMs: 5 * 60 * 1000 });

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'email',
      type: 'email',
      name: 'Email',
      maxAge: 60 * 15,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, request }) {
        if (!isAllowlisted(identifier)) return;
        const ip = request?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim()
          ?? request?.headers?.get?.('x-real-ip')
          ?? 'unknown';
        const limit = signInLimiter.check(`signin:${ip}`);
        if (!limit.ok) return;
        await sendMagicLinkEmail({ to: identifier, url });
      },
      generateVerificationToken: undefined,
    } as const,
  ],
});

export async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const session = await auth();
  if (!session?.user?.email || !isAllowlisted(session.user.email)) {
    redirect('/admin/signin');
  }
  return { userId: session.user.id as string, email: session.user.email };
}
