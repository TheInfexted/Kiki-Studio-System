import { sendEmail } from '@/server/email';
import {
  renderNewBookingAdminEmail,
  renderCustomerConfirmationEmail,
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
