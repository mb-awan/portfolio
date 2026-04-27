import { User } from '@/models/User';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { getSessionUser } from '@/lib/auth/session';
import { createTotpSecret, totpProvisioningUri } from '@/lib/auth/totp';
import { connectMongo } from '@/lib/db/mongoose';

export async function POST(): Promise<NextResponse> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    await connectMongo();
    const user = await User.findById(session.id);
    if (!user) {
      return jsonError('Unauthorized', 401);
    }
    if (user.tfaEnabled) {
      return jsonError('Two-factor authentication is already enabled', 400);
    }

    const secret = createTotpSecret();
    user.tfaSetupSecret = secret;
    await user.save();

    const otpauthUrl = totpProvisioningUri({ email: user.email, issuer: 'Muhammad Bilal', secret });
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    return NextResponse.json({
      otpauthUrl,
      qrDataUrl,
      secret,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
