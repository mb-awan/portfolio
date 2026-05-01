import { User, type UserDocument } from '@/models/User';
import { type NextResponse } from 'next/server';

import { type PermissionKey } from '@/lib/admin/permission-registry';
import { jsonError } from '@/lib/api/route-error';
import { type PublicUser, getSessionUser } from '@/lib/auth/session';
import { connectMongo } from '@/lib/db/mongoose';

export type AdminSessionContext = {
  session: PublicUser;
  user: UserDocument;
};

function sessionHasPermission(session: PublicUser, key: PermissionKey): boolean {
  return session.permissions.includes(key);
}

export async function requireAdminSession(permission: PermissionKey): Promise<AdminSessionContext | NextResponse> {
  return requireAdminSessionWithPermissions([permission]);
}

export async function requireAdminSessionWithPermissions(
  permissions: PermissionKey[]
): Promise<AdminSessionContext | NextResponse> {
  if (permissions.length === 0) {
    throw new Error('requireAdminSessionWithPermissions requires at least one permission key');
  }
  const session = await getSessionUser();
  if (!session) {
    return jsonError('Unauthorized', 401);
  }
  for (const permission of permissions) {
    if (!sessionHasPermission(session, permission)) {
      return jsonError('Forbidden', 403);
    }
  }
  await connectMongo();
  const user = await User.findById(session.id);
  if (!user) {
    return jsonError('Unauthorized', 401);
  }
  return { session, user };
}
