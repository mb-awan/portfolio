import { Role } from '@/models/Role';
import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/require-admin-api';
import { handleApiError } from '@/lib/api/route-error';
import { connectMongo } from '@/lib/db/mongoose';

export async function GET(): Promise<NextResponse> {
  try {
    const gate = await requireAdminSession('users.assign_role');
    if (gate instanceof NextResponse) {
      return gate;
    }

    await connectMongo();
    const roles = await Role.find().sort({ slug: 1 }).select('slug name description').lean();

    return NextResponse.json({
      roles: roles.map((r) => ({
        description: r.description ?? '',
        id: r._id.toString(),
        name: r.name,
        slug: r.slug,
      })),
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
