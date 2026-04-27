import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { getSessionUser } from '@/lib/auth/session';
import { verifyTotpToken } from '@/lib/auth/totp';
import { connectMongo } from '@/lib/db/mongoose';
import { tfaVerifySetupSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const body = tfaVerifySetupSchema.parse(await request.json());
    await connectMongo();

    const user = await User.findById(session.id);
    if (!user?.tfaSetupSecret) {
      return jsonError('Start setup from the profile page first', 400);
    }

    const ok = verifyTotpToken(user.tfaSetupSecret, body.otp);
    if (!ok) {
      return jsonError('Invalid authenticator code', 400);
    }

    user.tfaSecret = user.tfaSetupSecret;
    user.tfaSetupSecret = null;
    user.tfaEnabled = true;
    await user.save();

    return NextResponse.json({ message: 'Two-factor authentication is enabled', tfaEnabled: true });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
