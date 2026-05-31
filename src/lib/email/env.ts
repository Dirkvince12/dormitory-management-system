export function isEmailSendingConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  return Boolean(apiKey && from && apiKey.length > 10);
}

export function getResendFromEmail(): string {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!from) {
    throw new Error("Missing RESEND_FROM_EMAIL in .env");
  }
  return from;
}

export function getResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY in .env");
  }
  return apiKey;
}
