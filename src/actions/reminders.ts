"use server";

import { Resend } from "resend";
import {
  buildBulkPaymentReminderEmail,
  buildPaymentReminderEmail,
  type PaymentReminderDetails,
} from "@/lib/payment-reminder";
import {
  getResendApiKey,
  getResendFromEmail,
  isEmailSendingConfigured,
} from "@/lib/email/env";

export type ReminderSendResult =
  | { ok: true; mode: "sent"; count: number }
  | { ok: true; mode: "mailto" }
  | { ok: false; mode: "sent"; error: string };

export async function sendPaymentReminderAction(
  details: PaymentReminderDetails,
): Promise<ReminderSendResult> {
  if (!isEmailSendingConfigured()) {
    return { ok: true, mode: "mailto" };
  }

  try {
    const resend = new Resend(getResendApiKey());
    const { subject, body } = buildPaymentReminderEmail(details);

    const { error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: details.email,
      subject,
      text: body,
    });

    if (error) {
      return { ok: false, mode: "sent", error: error.message };
    }

    return { ok: true, mode: "sent", count: 1 };
  } catch (err) {
    return {
      ok: false,
      mode: "sent",
      error: err instanceof Error ? err.message : "Could not send reminder email",
    };
  }
}

export async function sendBulkPaymentReminderAction(
  emails: string[],
): Promise<ReminderSendResult> {
  const unique = [...new Set(emails.map((e) => e.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return { ok: false, mode: "sent", error: "No student emails to send to." };
  }

  if (!isEmailSendingConfigured()) {
    return { ok: true, mode: "mailto" };
  }

  try {
    const resend = new Resend(getResendApiKey());
    const { subject, body } = buildBulkPaymentReminderEmail();

    const { error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: getResendFromEmail(),
      bcc: unique,
      subject,
      text: body,
    });

    if (error) {
      return { ok: false, mode: "sent", error: error.message };
    }

    return { ok: true, mode: "sent", count: unique.length };
  } catch (err) {
    return {
      ok: false,
      mode: "sent",
      error: err instanceof Error ? err.message : "Could not send reminder emails",
    };
  }
}
