import type { OtpPurpose } from '@/models/OtpToken';

import nodemailer from 'nodemailer';

import { otpEmailBody, otpEmailSubject } from '@/lib/auth/otp';

function isDevLogOtp(): boolean {
  return process.env.NODE_ENV === 'development';
}

type OtpEmailTemplate = {
  html: string;
  text: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;
let verifyTransportPromise: Promise<void> | null = null;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getAppName(): string {
  return process.env.EMAIL_APP_NAME || 'Portfolio';
}

function getAppUrl(): string {
  return process.env.EMAIL_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
}

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = getRequiredEnv('SMTP_HOST');
  const port = Number(process.env.SMTP_PORT || 587);
  const user = getRequiredEnv('SMTP_USER');
  const pass = getRequiredEnv('SMTP_PASSWORD');
  const secure = port === 465;
  const rejectUnauthorized = process.env.SMTP_REJECT_UNAUTHORIZED !== 'false';

  cachedTransporter = nodemailer.createTransport({
    auth: { pass, user },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    host,
    maxConnections: 5,
    maxMessages: 100,
    pool: true,
    port,
    secure,
    socketTimeout: 20_000,
    tls: { rejectUnauthorized },
  });

  return cachedTransporter;
}

async function verifyTransporterOnce(): Promise<void> {
  if (verifyTransportPromise) {
    await verifyTransportPromise;
    return;
  }

  const transporter = getTransporter();
  verifyTransportPromise = transporter
    .verify()
    .then(() => {})
    .catch((error: unknown) => {
      verifyTransportPromise = null;
      throw error;
    });

  await verifyTransportPromise;
}

function getOtpTemplate(purpose: OtpPurpose, otp: string): OtpEmailTemplate {
  const appName = getAppName();
  const appUrl = getAppUrl();
  const safeOtp = escapeHtml(otp);
  const safeAppName = escapeHtml(appName);

  const isVerification = purpose === 'EMAIL_VERIFY';
  const heading = isVerification ? 'Verify your email address' : 'Reset your password';
  const intro = isVerification
    ? `Use the one-time code below to finish setting up your ${safeAppName} account.`
    : `Use the one-time code below to continue resetting your ${safeAppName} password.`;
  const accent = isVerification ? '#2563eb' : '#7c3aed';
  const safeHeading = escapeHtml(heading);
  const safeIntro = escapeHtml(intro);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${safeAppName}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:24px 28px;background:${accent};color:#ffffff;">
                <p style="margin:0;font-size:14px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;">${safeAppName}</p>
                <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;">${safeHeading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">${safeIntro}</p>
                <div style="margin:22px 0;padding:18px 16px;border:1px dashed ${accent};border-radius:12px;background:#f9fafb;text-align:center;">
                  <p style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">One-time code (expires in 2 minutes)</p>
                  <p style="margin:0;font-size:36px;letter-spacing:8px;font-weight:700;color:#111827;font-family:'Courier New',Courier,monospace;">${safeOtp}</p>
                </div>
                <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#4b5563;">If you did not request this action, you can ignore this message. Your account remains safe.</p>
                <a href="${appUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Open ${safeAppName}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #e5e7eb;background:#fafafa;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">Sent by ${safeAppName}. Please do not reply to this automated email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${otpEmailBody(purpose, otp)}\n\nOpen ${appName}: ${appUrl}\n\nIf you did not request this action, you can ignore this message.`;

  return { html, text };
}

function isTransientEmailError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String(error.code) : '';
  return ['ECONNECTION', 'EENVELOPE', 'ESOCKET', 'ETIMEDOUT'].includes(code);
}

async function sendWithRetry(message: nodemailer.SendMailOptions): Promise<void> {
  const transporter = getTransporter();
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await transporter.sendMail(message);
      return;
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt || !isTransientEmailError(error)) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }
}

export async function sendOtpEmail(to: string, purpose: OtpPurpose, otp: string): Promise<void> {
  const subject = otpEmailSubject(purpose);
  const { html, text } = getOtpTemplate(purpose, otp);

  if (isDevLogOtp()) {
    // eslint-disable-next-line no-console -- intentional dev-only OTP visibility
    console.info(`[dev-email] To: ${to}\nSubject: ${subject}\nOTP (plaintext, not stored): ${otp}\n`);
    return;
  }

  const from = getRequiredEnv('SMTP_FROM');
  const replyTo = to;

  await verifyTransporterOnce();

  await sendWithRetry({
    from,
    html,
    replyTo,
    subject,
    text,
    to,
  });
}
