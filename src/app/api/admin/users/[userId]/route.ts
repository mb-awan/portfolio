import { Role } from '@/models/Role';
import { User } from '@/models/User';
import { Types } from 'mongoose';
import { NextResponse } from 'next/server';

import { type PermissionKey } from '@/lib/admin/permission-registry';
import { requireAdminSessionWithPermissions } from '@/lib/admin/require-admin-api';
import { handleApiError, jsonError } from '@/lib/api/route-error';
import { connectMongo } from '@/lib/db/mongoose';
import { adminPatchUserSchema } from '@/lib/validation/admin';

type RouteContext = { params: { userId: string } };

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { userId } = context.params;
    if (!Types.ObjectId.isValid(userId)) {
      return jsonError('Invalid user id', 400);
    }

    const body = adminPatchUserSchema.parse(await request.json());

    const needsEdit = body.name !== undefined || body.emailVerified !== undefined;
    const needsAssign = body.roleId !== undefined;

    const required: PermissionKey[] = [];
    if (needsEdit) {
      required.push('users.edit');
    }
    if (needsAssign) {
      required.push('users.assign_role');
    }

    const gate = await requireAdminSessionWithPermissions(required);
    if (gate instanceof NextResponse) {
      return gate;
    }
    const { session } = gate;

    await connectMongo();

    const target = await User.findById(userId);
    if (!target) {
      return jsonError('User not found', 404);
    }

    if (body.name !== undefined) {
      target.name = body.name;
    }
    if (body.emailVerified !== undefined) {
      target.emailVerified = body.emailVerified;
    }
    if (body.roleId !== undefined) {
      if (body.roleId === null || body.roleId === '') {
        target.role = null;
      } else {
        const role = await Role.findById(body.roleId);
        if (!role) {
          return jsonError('Role not found', 400);
        }
        target.role = role._id;
      }
    }

    if (session.id === userId && body.roleId !== undefined && (body.roleId === null || body.roleId === '')) {
      return jsonError('You cannot remove your own role from this account.', 400);
    }

    await target.save();

    const populated = await User.findById(target._id)
      .select('-passwordHash -tfaSecret -tfaSetupSecret')
      .populate('role', 'slug name')
      .lean();

    if (!populated) {
      return jsonError('User not found', 404);
    }

    const role =
      populated.role && typeof populated.role === 'object' && '_id' in populated.role
        ? {
            id: (populated.role._id as Types.ObjectId).toString(),
            name: (populated.role as { name?: string }).name,
            slug: (populated.role as { slug?: string }).slug,
          }
        : null;

    return NextResponse.json({
      createdAt: populated.createdAt,
      email: populated.email,
      emailVerified: populated.emailVerified,
      id: populated._id.toString(),
      name: populated.name,
      role,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
