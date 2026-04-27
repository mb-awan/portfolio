import { User } from '@/models/User';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { MFA_COOKIE_NAME } from '@/lib/auth/constants';
import { clearMfaCookie, setAuthCookie } from '@/lib/auth/cookies';
import { signAuthToken, verifyMfaPendingToken } from '@/lib/auth/jwt';
import { verifyTotpToken } from '@/lib/auth/totp';
import { connectMongo } from '@/lib/db/mongoose';
import { verifyTfaLoginSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = verifyTfaLoginSchema.parse(await request.json());
    const mfaCookie = cookies().get(MFA_COOKIE_NAME)?.value;
    if (!mfaCookie) {
      return jsonError('Two-factor session expired. Please sign in again.', 401);
    }

    const { sub } = await verifyMfaPendingToken(mfaCookie);
    await connectMongo();

    const user = await User.findById(sub);
    if (!user?.tfaEnabled || !user.tfaSecret) {
      clearMfaCookie();
      return jsonError('Two-factor authentication is not enabled for this account', 400);
    }

    const ok = verifyTotpToken(user.tfaSecret, body.otp);
    if (!ok) {
      return jsonError('Invalid authenticator code', 400);
    }

    clearMfaCookie();
    const token = await signAuthToken(user._id.toString());
    setAuthCookie(token);

    return NextResponse.json({
      user: {
        email: user.email,
        emailVerified: user.emailVerified,
        id: user._id.toString(),
        name: user.name,
        tfaEnabled: user.tfaEnabled,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
