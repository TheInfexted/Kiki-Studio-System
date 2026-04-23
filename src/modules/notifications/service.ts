import { sendEmail } from '@/server/email';
import {
  renderNewBookingAdminEmail,
  renderCustomerConfirmationEmail,
  renderMagicLinkEmail,
  renderBookingConfirmedEmail,
  renderBookingRejectedEmail,
  type BookingEmailContext,
} from './email-templates';

export async function sendBookingCreatedNotifications(params: {
  adminEmails: string[];
  customerEmail?: string;
  context: BookingEmailContext;
}): Promise<{ adminResult: { id: string }; customerResult: { id: string } | null }> {
  const admin = renderNewBookingAdminEmail(params.context);
  const adminResult = await sendEmail({
    to: params.adminEmails,
    subject: admin.subject,
    html: admin.html,
    text: admin.text,
    replyTo: params.context.customerEmail,
  });

  let customerResult: { id: string } | null = null;
  if (params.customerEmail) {
    const cust = renderCustomerConfirmationEmail(params.context);
    customerResult = await sendEmail({
      to: params.customerEmail,
      subject: cust.subject,
      html: cust.html,
      text: cust.text,
    });
  }
  return { adminResult, customerResult };
}

export async function sendMagicLinkEmail(params: { to: string; url: string }): Promise<{ id: string }> {
  const rendered = renderMagicLinkEmail({ email: params.to, url: params.url });
  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

export async function sendBookingConfirmedEmail(params: {
  to: string;
  context: BookingEmailContext;
}): Promise<{ id: string }> {
  const rendered = renderBookingConfirmedEmail(params.context);
  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

export async function sendBookingRejectedEmail(params: {
  to: string;
  reason: string | null;
  context: BookingEmailContext;
}): Promise<{ id: string }> {
  const rendered = renderBookingRejectedEmail(params.context, params.reason);
  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}
