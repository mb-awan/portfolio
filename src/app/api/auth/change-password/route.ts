import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { getSessionUser } from '@/lib/auth/session';
import { connectMongo } from '@/lib/db/mongoose';
import { changePasswordSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const body = changePasswordSchema.parse(await request.json());
    await connectMongo();

    const user = await User.findById(session.id);
    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    const valid = await verifyPassword(body.currentPassword, user.passwordHash);
    if (!valid) {
      return jsonError('Current password is incorrect', 400);
    }

    user.passwordHash = await hashPassword(body.newPassword);
    await user.save();

    return NextResponse.json({ message: 'Password updated' });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
