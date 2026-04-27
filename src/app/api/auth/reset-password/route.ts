import { OtpToken } from '@/models/OtpToken';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { verifyOtpHash } from '@/lib/auth/otp';
import { hashPassword } from '@/lib/auth/password';
import { connectMongo } from '@/lib/db/mongoose';
import { resetPasswordSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = resetPasswordSchema.parse(await request.json());
    await connectMongo();

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      return jsonError('Invalid email or code', 400);
    }

    const record = await OtpToken.findOne({ purpose: 'PASSWORD_RESET', userId: user._id });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      return jsonError('Code expired or not found', 400);
    }

    if (!verifyOtpHash(body.otp, user._id.toString(), record.hash)) {
      return jsonError('Invalid code', 400);
    }

    user.passwordHash = await hashPassword(body.newPassword);
    await user.save();
    await OtpToken.deleteOne({ _id: record._id });

    return NextResponse.json({ message: 'Password has been reset. You can sign in now.' });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
