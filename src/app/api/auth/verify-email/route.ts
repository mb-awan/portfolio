import { OtpToken } from '@/models/OtpToken';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api/route-error';
import { setAuthCookie } from '@/lib/auth/cookies';
import { signAuthToken } from '@/lib/auth/jwt';
import { verifyOtpHash } from '@/lib/auth/otp';
import { connectMongo } from '@/lib/db/mongoose';
import { verifyEmailSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = verifyEmailSchema.parse(await request.json());
    await connectMongo();

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or code' }, { status: 400 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified' });
    }

    const record = await OtpToken.findOne({ purpose: 'EMAIL_VERIFY', userId: user._id });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Code expired or not found. Request a new code.' }, { status: 400 });
    }

    if (!verifyOtpHash(body.otp, user._id.toString(), record.hash)) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    user.emailVerified = true;
    await user.save();
    await OtpToken.deleteOne({ _id: record._id });

    const token = await signAuthToken(user._id.toString());
    setAuthCookie(token);

    return NextResponse.json({ message: 'Email verified', verified: true });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
