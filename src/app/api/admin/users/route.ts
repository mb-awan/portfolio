import { User } from '@/models/User';
import { Types } from 'mongoose';
import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/require-admin-api';
import { handleApiError, jsonError } from '@/lib/api/route-error';
import { connectMongo } from '@/lib/db/mongoose';
import { adminListUsersQuerySchema } from '@/lib/validation/admin';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authResult = await requireAdminSession('users.view');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const url = new URL(request.url);
    const parsed = adminListUsersQuerySchema.safeParse({
      limit: url.searchParams.get('limit') ?? undefined,
      page: url.searchParams.get('page') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
    });
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid query', 400);
    }
    const { limit, page, q } = parsed.data;
    const skip = (page - 1) * limit;

    await connectMongo();

    const filter =
      q.trim().length > 0
        ? {
            $or: [
              { email: { $options: 'i', $regex: escapeRegex(q.trim()) } },
              { name: { $options: 'i', $regex: escapeRegex(q.trim()) } },
            ],
          }
        : {};

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -tfaSecret -tfaSetupSecret')
        .populate('role', 'slug name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const users = items.map((u) => ({
      createdAt: u.createdAt,
      email: u.email,
      emailVerified: u.emailVerified,
      id: u._id.toString(),
      name: u.name,
      role:
        u.role && typeof u.role === 'object' && '_id' in u.role
          ? {
              id: (u.role._id as Types.ObjectId).toString(),
              name: (u.role as { name?: string }).name,
              slug: (u.role as { slug?: string }).slug,
            }
          : null,
    }));

    return NextResponse.json({ limit, page, total, users });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
