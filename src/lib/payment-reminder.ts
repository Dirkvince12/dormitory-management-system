import type { PaymentStatus } from "@/types/entities";

export type PaymentReminderDetails = {
  email: string;
  studentName: string;
  description: string;
  amount: number;
  dueDate: string;
  period: string;
  status: PaymentStatus;
};

export function buildPaymentReminderEmail(details: PaymentReminderDetails): {
  subject: string;
  body: string;
} {
  const statusLabel = details.status === "overdue" ? "overdue" : "due";
  const subject = `Payment Reminder: ${details.description} (${details.period})`;
  const body = `Dear ${details.studentName},

This is a friendly reminder that your ${details.description} for ${details.period} is ${statusLabel}.

Amount: ₱${details.amount.toLocaleString()}
Due date: ${details.dueDate}

Please settle your payment at your earliest convenience. If you have already paid, please disregard this message.

Thank you,
Dormitory Management`;

  return { subject, body };
}

export function buildPaymentReminderMailto(details: PaymentReminderDetails): string {
  const { subject, body } = buildPaymentReminderEmail(details);
  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${details.email}?${params.toString()}`;
}

export function buildBulkPaymentReminderMailto(emails: string[]): string | null {
  const unique = [...new Set(emails.map((e) => e.trim()).filter(Boolean))];
  if (unique.length === 0) return null;

  const { subject, body } = buildBulkPaymentReminderEmail();

  const params = new URLSearchParams({
    bcc: unique.join(","),
    subject,
    body,
  });
  return `mailto:?${params.toString()}`;
}

export function buildBulkPaymentReminderEmail(): { subject: string; body: string } {
  const subject = "Dormitory Payment Reminder";
  const body = `Dear student,

This is a reminder that you have an outstanding dormitory payment on your account.

Please settle your balance at your earliest convenience. If you have already paid, please disregard this message.

Thank you,
Dormitory Management`;

  return { subject, body };
}

export function openPaymentReminderMailto(details: PaymentReminderDetails): void {
  window.location.href = buildPaymentReminderMailto(details);
}

export function openBulkPaymentReminderMailto(emails: string[]): void {
  const url = buildBulkPaymentReminderMailto(emails);
  if (url) window.location.href = url;
}
