import { Permission } from '@/models/Permission';
import { Role } from '@/models/Role';
import { User } from '@/models/User';
import { config } from 'dotenv';
import { resolve } from 'node:path';

import { ALL_PERMISSION_KEYS, PERMISSION_DEFINITIONS } from '@/lib/admin/permission-registry';
import { hashPassword } from '@/lib/auth/password';
import { connectMongo } from '@/lib/db/mongoose';

function resolveEnvFile(): string {
  if (process.env.NODE_ENV === 'production') {
    return '.env.production';
  }
  if (process.env.NODE_ENV === 'development') {
    return '.env.development';
  }
  return '.env';
}

async function main(): Promise<void> {
  const envFile = resolveEnvFile();
  config({ path: resolve(process.cwd(), envFile) });
  console.log(`[db:seed] NODE_ENV=${process.env.NODE_ENV ?? 'undefined'} using ${envFile}`);

  await connectMongo();

  for (const p of PERMISSION_DEFINITIONS) {
    await Permission.updateOne(
      { key: p.key },
      { $set: { description: p.description, module: p.module, sortOrder: p.sortOrder } },
      { upsert: true }
    );
  }

  const adminKeys = [...ALL_PERMISSION_KEYS];
  const subadminKeys = ['admin.access', 'users.view', 'users.edit', 'roles.view'];

  await Role.updateOne(
    { slug: 'admin' },
    {
      $set: {
        description: 'Full access to the admin panel and all current modules.',
        isSystem: true,
        name: 'Administrator',
        permissionKeys: adminKeys,
      },
    },
    { upsert: true }
  );

  await Role.updateOne(
    { slug: 'subadmin' },
    {
      $set: {
        description:
          'Example limited operator: can use the panel and manage users, but cannot assign roles or reserved modules.',
        isSystem: true,
        name: 'Sub-administrator',
        permissionKeys: subadminKeys,
      },
    },
    { upsert: true }
  );

  const adminRole = await Role.findOne({ slug: 'admin' });
  if (!adminRole) {
    throw new Error('Admin role missing after seed');
  }

  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const plainPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !plainPassword) {
    console.warn(
      '[db:seed] ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD not set — skipped creating or updating the admin user.'
    );
  } else {
    const passwordHash = await hashPassword(plainPassword);
    const existing = await User.findOne({ email });
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.emailVerified = true;
      existing.role = adminRole._id;
      await existing.save();
      console.log(`[db:seed] Updated existing user ${email} with the admin role.`);
    } else {
      await User.create({
        email,
        emailVerified: true,
        name: 'Administrator',
        passwordHash,
        role: adminRole._id,
      });
      console.log(`[db:seed] Created admin user ${email}.`);
    }
  }

  console.log('[db:seed] Permissions and roles are in sync with the permission registry.');
}

main()
  .then(async () => {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
