import { Permission } from '@/models/Permission';
import { Role } from '@/models/Role';
import { config } from 'dotenv';
import { resolve } from 'node:path';

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
  console.log(`[db:rbac] NODE_ENV=${process.env.NODE_ENV ?? 'undefined'} using ${envFile}`);

  await connectMongo();

  const permissions = await Permission.find().sort({ key: 1, sortOrder: 1 }).lean();
  const roles = await Role.find().sort({ slug: 1 }).lean();

  console.log('\n=== Permissions (%d) ===\n', permissions.length);
  for (const p of permissions) {
    console.log(`[${p.module}] ${p.key}`);
    console.log(`    ${p.description}`);
    console.log('');
  }

  console.log('=== Roles (%d) ===\n', roles.length);
  for (const r of roles) {
    console.log(`${r.name} (${r.slug})${r.isSystem ? ' [system]' : ''}`);
    if (r.description) {
      console.log(`  ${r.description}`);
    }
    const keys = Array.isArray(r.permissionKeys) ? r.permissionKeys : [];
    console.log(`  permissions (${keys.length}): ${keys.join(', ')}`);
    console.log('');
  }
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
