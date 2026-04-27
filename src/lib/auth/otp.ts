import type { OtpPurpose } from '@/models/OtpToken';

import { createHmac, randomInt, timingSafeEqual } from 'crypto';

export const OTP_EXPIRY_MS = 2 * 60 * 1000;

function getPepper(): string {
  const pepper = process.env.OTP_PEPPER;
  if (!pepper) {
    throw new Error('OTP_PEPPER is not set');
  }
  return pepper;
}

export function generateNumericOtp(length = 6): string {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, '0');
}

export function hashOtp(otp: string, userId: string): string {
  return createHmac('sha256', getPepper()).update(`${userId}:${otp}`).digest('hex');
}

export function verifyOtpHash(otp: string, userId: string, storedHash: string): boolean {
  const computedHex = hashOtp(otp, userId);
  if (computedHex.length !== storedHash.length) {
    return false;
  }
  const computed = Buffer.from(computedHex, 'hex');
  const expected = Buffer.from(storedHash, 'hex');
  if (computed.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(computed, expected);
}

export function otpEmailSubject(purpose: OtpPurpose): string {
  if (purpose === 'EMAIL_VERIFY') {
    return 'Verify your email';
  }
  return 'Reset your password';
}

export function otpEmailBody(purpose: OtpPurpose, otp: string): string {
  if (purpose === 'EMAIL_VERIFY') {
    return `Your verification code is: ${otp}\n\nThis code expires in 2 minutes.`;
  }
  return `Your password reset code is: ${otp}\n\nThis code expires in 2 minutes.`;
}
