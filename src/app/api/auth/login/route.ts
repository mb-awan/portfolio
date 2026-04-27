import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { clearAuthCookie, clearMfaCookie, setAuthCookie, setMfaCookie } from '@/lib/auth/cookies';
import { signAuthToken, signMfaPendingToken } from '@/lib/auth/jwt';
import { verifyPassword } from '@/lib/auth/password';
import { connectMongo } from '@/lib/db/mongoose';
import { loginSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = loginSchema.parse(await request.json());
    await connectMongo();

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      return jsonError('Invalid email or password', 401);
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return jsonError('Invalid email or password', 401);
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { code: 'EMAIL_NOT_VERIFIED', error: 'Please verify your email before signing in.' },
        { status: 403 }
      );
    }

    if (user.tfaEnabled && user.tfaSecret) {
      clearAuthCookie();
      const mfaToken = await signMfaPendingToken(user._id.toString());
      setMfaCookie(mfaToken);
      return NextResponse.json({ requiresTfa: true });
    }

    clearMfaCookie();
    const token = await signAuthToken(user._id.toString());
    setAuthCookie(token);

    return NextResponse.json({
      requiresTfa: false,
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
