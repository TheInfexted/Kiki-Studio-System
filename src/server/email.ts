import { Resend } from 'resend';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const globalForResend = globalThis as unknown as { resend?: Resend };

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  return globalForResend.resend ?? (globalForResend.resend = new Resend(apiKey));
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error('EMAIL_FROM is not set');

  if (process.env.EMAIL_TRANSPORT === 'file') {
    return writeToMailbox({ ...input, from });
  }

  const resend = getResend();
  const res = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });
  if (res.error) throw new Error(`Resend error: ${res.error.message}`);
  return { id: res.data!.id };
}

function writeToMailbox(envelope: SendEmailInput & { from: string }): { id: string } {
  const mailbox = join(process.cwd(), 'tests', '.mailbox');
  mkdirSync(mailbox, { recursive: true });
  const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const recipient = Array.isArray(envelope.to) ? envelope.to[0] : envelope.to;
  const safeRecipient = recipient.replace(/[^a-zA-Z0-9@.-]/g, '_');
  const path = join(mailbox, `${id}-${safeRecipient}.json`);
  writeFileSync(path, JSON.stringify(envelope, null, 2));
  return { id };
}
