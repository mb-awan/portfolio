import { OtpToken } from '@/models/OtpToken';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { clearAuthCookie } from '@/lib/auth/cookies';
import { verifyPassword } from '@/lib/auth/password';
import { getSessionUser } from '@/lib/auth/session';
import { deleteCloudinaryImageByUrl, shouldDeleteOldImageBeforeStoringNew } from '@/lib/cloudinary/delete-asset';
import { connectMongo } from '@/lib/db/mongoose';
import { deleteAccountSchema, updateProfileSchema } from '@/lib/validation/auth';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError('Unauthorized', 401);
    }
    await connectMongo();
    const user = await User.findById(session.id).lean();
    if (!user) {
      return jsonError('Unauthorized', 401);
    }
    return NextResponse.json({
      bio: user.bio ?? '',
      email: user.email,
      emailVerified: user.emailVerified,
      id: user._id.toString(),
      imageUrl: user.imageUrl ?? null,
      name: user.name,
      tfaEnabled: user.tfaEnabled,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const body = updateProfileSchema.parse(await request.json());

    await connectMongo();
    const user = await User.findById(session.id);
    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    if (body.name !== undefined) {
      user.name = body.name;
    }
    if (body.bio !== undefined) {
      user.bio = body.bio;
    }
    if (body.imageUrl !== undefined) {
      const previous = user.imageUrl ?? null;
      if (body.imageUrl === null) {
        await deleteCloudinaryImageByUrl(previous);
        user.imageUrl = null;
      } else {
        if (shouldDeleteOldImageBeforeStoringNew({ newImageUrl: body.imageUrl, oldImageUrl: previous })) {
          await deleteCloudinaryImageByUrl(previous);
        }
        user.imageUrl = body.imageUrl;
      }
    }

    await user.save();

    return NextResponse.json({
      bio: user.bio ?? '',
      email: user.email,
      emailVerified: user.emailVerified,
      id: user._id.toString(),
      imageUrl: user.imageUrl ?? null,
      name: user.name,
      tfaEnabled: user.tfaEnabled,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const body = deleteAccountSchema.parse(await request.json());
    await connectMongo();

    const user = await User.findById(session.id);
    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return jsonError('Password is incorrect', 400);
    }

    await deleteCloudinaryImageByUrl(user.imageUrl ?? null);

    await OtpToken.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    clearAuthCookie();

    return NextResponse.json({ message: 'Account deleted' });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
