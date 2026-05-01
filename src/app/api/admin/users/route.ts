import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { mapAdminUserListItem } from '@/lib/admin/map-admin-user';
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

    const rx = escapeRegex(q.trim());
    const filter =
      q.trim().length > 0
        ? {
            $or: [
              { email: { $options: 'i', $regex: rx } },
              { location: { $options: 'i', $regex: rx } },
              { name: { $options: 'i', $regex: rx } },
              { phone: { $options: 'i', $regex: rx } },
              { 'address.city': { $options: 'i', $regex: rx } },
              { 'address.district': { $options: 'i', $regex: rx } },
              { 'address.province': { $options: 'i', $regex: rx } },
              { 'address.country': { $options: 'i', $regex: rx } },
              { 'address.zipCode': { $options: 'i', $regex: rx } },
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

    const users = items.map((u) => mapAdminUserListItem(u));

    return NextResponse.json({ limit, page, total, users });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
