/**
 * Central registry of permission keys. Seeders sync these into the Permission collection.
 * Add new keys here first, then run `npm run db:seed` to upsert metadata in MongoDB.
 */
export type PermissionModule = 'admin' | 'blog' | 'courses' | 'roles' | 'users';

export type PermissionDefinition = {
  description: string;
  key: string;
  module: PermissionModule;
  sortOrder: number;
};

export const PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    description: 'Open the admin panel and shared admin shell.',
    key: 'admin.access',
    module: 'admin',
    sortOrder: 10,
  },
  {
    description: 'List and view user records.',
    key: 'users.view',
    module: 'users',
    sortOrder: 20,
  },
  {
    description: 'Update user profile fields (e.g. name, verification flag).',
    key: 'users.edit',
    module: 'users',
    sortOrder: 30,
  },
  {
    description: 'Assign or change a user’s role.',
    key: 'users.assign_role',
    module: 'users',
    sortOrder: 40,
  },
  {
    description: 'View roles and their permission mappings (future UI).',
    key: 'roles.view',
    module: 'roles',
    sortOrder: 50,
  },
  {
    description: 'Manage blog content (reserved for future admin modules).',
    key: 'blog.manage',
    module: 'blog',
    sortOrder: 100,
  },
  {
    description: 'Manage courses (reserved for future admin modules).',
    key: 'courses.manage',
    module: 'courses',
    sortOrder: 110,
  },
] as const;

export type PermissionKey = (typeof PERMISSION_DEFINITIONS)[number]['key'];

export const ALL_PERMISSION_KEYS: readonly PermissionKey[] = PERMISSION_DEFINITIONS.map((p) => p.key);

export function isPermissionKey(value: string): value is PermissionKey {
  return (ALL_PERMISSION_KEYS as readonly string[]).includes(value);
}
