import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { verifyPassword } from '@/lib/auth/password';
import { getSessionUser } from '@/lib/auth/session';
import { verifyTotpToken } from '@/lib/auth/totp';
import { connectMongo } from '@/lib/db/mongoose';
import { tfaDisableSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const body = tfaDisableSchema.parse(await request.json());
    await connectMongo();

    const user = await User.findById(session.id);
    if (!user?.tfaEnabled || !user.tfaSecret) {
      return jsonError('Two-factor authentication is not enabled', 400);
    }

    const passwordOk = await verifyPassword(body.password, user.passwordHash);
    if (!passwordOk) {
      return jsonError('Password is incorrect', 400);
    }

    const totpOk = verifyTotpToken(user.tfaSecret, body.otp);
    if (!totpOk) {
      return jsonError('Invalid authenticator code', 400);
    }

    user.tfaEnabled = false;
    user.tfaSecret = null;
    user.tfaSetupSecret = null;
    await user.save();

    return NextResponse.json({ message: 'Two-factor authentication disabled', tfaEnabled: false });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
