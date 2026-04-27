import { type OtpPurpose, OtpToken } from '@/models/OtpToken';

import { OTP_EXPIRY_MS, generateNumericOtp, hashOtp } from '@/lib/auth/otp';
import { connectMongo } from '@/lib/db/mongoose';
import { sendOtpEmail } from '@/lib/mail';

export async function issueOtp(userId: string, email: string, purpose: OtpPurpose): Promise<void> {
  await connectMongo();
  const otp = generateNumericOtp();
  const hash = hashOtp(otp, userId);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  await OtpToken.findOneAndUpdate({ purpose, userId }, { $set: { expiresAt, hash } }, { new: true, upsert: true });
  await sendOtpEmail(email, purpose, otp);
}
