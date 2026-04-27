import type { OtpPurpose } from '@/models/OtpToken';

import nodemailer from 'nodemailer';

import { otpEmailBody, otpEmailSubject } from '@/lib/auth/otp';

function isDevLogOtp(): boolean {
  return process.env.NODE_ENV === 'development';
}

export async function sendOtpEmail(to: string, purpose: OtpPurpose, otp: string): Promise<void> {
  const subject = otpEmailSubject(purpose);
  const text = otpEmailBody(purpose, otp);

  if (isDevLogOtp()) {
    // eslint-disable-next-line no-console -- intentional dev-only OTP visibility
    console.info(`[dev-email] To: ${to}\nSubject: ${subject}\nOTP (plaintext, not stored): ${otp}\n`);
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error('SMTP is not configured for production email delivery');
  }

  const transporter = nodemailer.createTransport({
    auth: { pass, user },
    host,
    port,
    secure: port === 465,
  });

  await transporter.sendMail({
    from,
    subject,
    text,
    to,
  });
}
