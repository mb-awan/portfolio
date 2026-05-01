import { OtpToken } from '@/models/OtpToken';
import { User, type UserDocument } from '@/models/User';
import { NextResponse } from 'next/server';

import { getRbacForUser } from '@/lib/admin/rbac';
import { handleApiError, jsonError } from '@/lib/api/route-error';
import { clearAuthCookie } from '@/lib/auth/cookies';
import { verifyPassword } from '@/lib/auth/password';
import { getSessionUser } from '@/lib/auth/session';
import { deleteCloudinaryImageByUrl, shouldDeleteOldImageBeforeStoringNew } from '@/lib/cloudinary/delete-asset';
import { connectMongo } from '@/lib/db/mongoose';
import { profileFieldsFromUser } from '@/lib/user/profile-response';
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
    const rbac = await getRbacForUser(user as UserDocument);
    return NextResponse.json({
      ...profileFieldsFromUser(user as UserDocument),
      email: user.email,
      emailVerified: user.emailVerified,
      id: user._id.toString(),
      imageUrl: user.imageUrl ?? null,
      name: user.name,
      permissions: rbac.permissions,
      roleSlug: rbac.roleSlug,
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
    if (body.phone !== undefined) {
      user.phone = body.phone.trim();
    }
    if (body.gender !== undefined) {
      user.gender = body.gender;
    }
    if (body.address !== undefined) {
      const prev = (user.address ?? {}) as Record<string, string>;
      user.set('address', {
        city: body.address.city !== undefined ? body.address.city.trim() : prev.city ?? '',
        country: body.address.country !== undefined ? body.address.country.trim() : prev.country ?? '',
        district: body.address.district !== undefined ? body.address.district.trim() : prev.district ?? '',
        province: body.address.province !== undefined ? body.address.province.trim() : prev.province ?? '',
        zipCode: body.address.zipCode !== undefined ? body.address.zipCode.trim() : prev.zipCode ?? '',
      });
    }
    if (body.socialLinks !== undefined) {
      user.socialLinks = body.socialLinks
        .map((l) => ({ platform: l.platform.trim(), url: l.url.trim() }))
        .filter((l) => l.platform.length > 0 && l.url.length > 0);
    }
    if (body.education !== undefined) {
      user.education = body.education.map((e) => ({
        degree: e.degree?.trim() ?? '',
        endYear: e.endYear,
        field: e.field?.trim() ?? '',
        institution: e.institution?.trim() ?? '',
        notes: e.notes?.trim() ?? '',
        startYear: e.startYear,
      }));
    }
    if (body.experience !== undefined) {
      user.experience = body.experience.map((e) => ({
        company: e.company?.trim() ?? '',
        description: e.description?.trim() ?? '',
        employmentType: e.employmentType?.trim() ?? '',
        endDate: e.endDate?.trim() ?? '',
        location: e.location?.trim() ?? '',
        startDate: e.startDate?.trim() ?? '',
        title: e.title?.trim() ?? '',
      }));
    }
    if (body.businessDetails !== undefined) {
      const d = body.businessDetails;
      const merged = {
        companyName: d.companyName?.trim() ?? '',
        description: d.description?.trim() ?? '',
        industry: d.industry?.trim() ?? '',
        role: d.role?.trim() ?? '',
        website: d.website?.trim() ?? '',
      };
      const allEmpty = Object.values(merged).every((v) => v.length === 0);
      user.businessDetails = allEmpty ? undefined : merged;
    }

    await user.save();

    const rbac = await getRbacForUser(user);
    return NextResponse.json({
      ...profileFieldsFromUser(user),
      email: user.email,
      emailVerified: user.emailVerified,
      id: user._id.toString(),
      imageUrl: user.imageUrl ?? null,
      name: user.name,
      permissions: rbac.permissions,
      roleSlug: rbac.roleSlug,
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
