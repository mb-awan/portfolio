/* eslint-disable testing-library/await-async-queries -- mongoose uses findById; not Testing Library */
import { Role } from '@/models/Role';
import { User, type UserDocument } from '@/models/User';

import { type PermissionKey } from '@/lib/admin/permission-registry';
import { connectMongo } from '@/lib/db/mongoose';

export type UserRbac = {
  permissions: string[];
  roleSlug: null | string;
};

/** Caller must have called `connectMongo()` already. */
export async function getRbacForUser(user: Pick<UserDocument, 'role'>): Promise<UserRbac> {
  const roleId = user.role;
  if (!roleId) {
    return { permissions: [], roleSlug: null };
  }
  const role = await Role.findById(roleId).lean();
  if (!role) {
    return { permissions: [], roleSlug: null };
  }
  const keys = Array.isArray(role.permissionKeys) ? role.permissionKeys.filter(Boolean) : [];
  return { permissions: keys, roleSlug: role.slug };
}

export async function getRbacForUserId(userId: string): Promise<UserRbac> {
  await connectMongo();
  const user = await User.findById(userId).select('role').lean();
  if (!user) {
    return { permissions: [], roleSlug: null };
  }
  return getRbacForUser(user as Pick<UserDocument, 'role'>);
}

export function hasPermission(rbac: UserRbac, key: PermissionKey): boolean {
  return rbac.permissions.includes(key);
}
