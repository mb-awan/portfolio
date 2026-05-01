import { User, type UserDocument } from '@/models/User';
import { cookies } from 'next/headers';

import { getRbacForUser } from '@/lib/admin/rbac';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { connectMongo } from '@/lib/db/mongoose';

export type PublicUser = {
  bio: string;
  email: string;
  emailVerified: boolean;
  id: string;
  imageUrl: null | string;
  name: string;
  permissions: string[];
  roleSlug: null | string;
  tfaEnabled: boolean;
};

function toPublicUser(doc: UserDocument, rbac: { permissions: string[]; roleSlug: null | string }): PublicUser {
  return {
    bio: doc.bio ?? '',
    email: doc.email,
    emailVerified: doc.emailVerified,
    id: doc._id.toString(),
    imageUrl: doc.imageUrl ?? null,
    name: doc.name,
    permissions: rbac.permissions,
    roleSlug: rbac.roleSlug,
    tfaEnabled: doc.tfaEnabled,
  };
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  try {
    const { sub } = await verifyAuthToken(token);
    await connectMongo();
    const user = await User.findById(sub).lean();
    if (!user) {
      return null;
    }
    const rbac = await getRbacForUser(user as UserDocument);
    return toPublicUser(user as UserDocument, rbac);
  } catch {
    return null;
  }
}

export async function requireSessionUser(): Promise<PublicUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
