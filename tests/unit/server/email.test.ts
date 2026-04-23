import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readdir, readFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { sendEmail } from '@/server/email';

const MAILBOX = join(process.cwd(), 'tests', '.mailbox');

describe('sendEmail in file transport mode', () => {
  beforeEach(async () => {
    process.env.EMAIL_TRANSPORT = 'file';
    process.env.EMAIL_FROM = 'Kiki <bookings@test>';
    await rm(MAILBOX, { recursive: true, force: true });
    await mkdir(MAILBOX, { recursive: true });
  });

  afterEach(async () => {
    delete process.env.EMAIL_TRANSPORT;
    await rm(MAILBOX, { recursive: true, force: true });
  });

  it('writes an email to the mailbox directory instead of calling Resend', async () => {
    const result = await sendEmail({
      to: 'customer@test.local',
      subject: 'Hello',
      html: '<p>hi</p>',
      text: 'hi',
    });
    expect(result.id).toMatch(/^file_/);
    const entries = await readdir(MAILBOX);
    expect(entries.length).toBe(1);
    expect(entries[0]).toMatch(/^file_\d+_[a-z0-9]{6}-/);
    const raw = await readFile(join(MAILBOX, entries[0]!), 'utf8');
    const parsed = JSON.parse(raw);
    expect(parsed).toMatchObject({
      to: 'customer@test.local',
      subject: 'Hello',
      html: '<p>hi</p>',
      text: 'hi',
      from: 'Kiki <bookings@test>',
    });
  });

  it('handles array recipients', async () => {
    await sendEmail({
      to: ['a@test', 'b@test'],
      subject: 'multi',
      html: '<p>m</p>',
    });
    const entries = await readdir(MAILBOX);
    expect(entries.length).toBe(1);
    const parsed = JSON.parse(await readFile(join(MAILBOX, entries[0]!), 'utf8'));
    expect(parsed.to).toEqual(['a@test', 'b@test']);
  });
});
