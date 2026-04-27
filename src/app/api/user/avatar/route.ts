import { NextResponse } from 'next/server';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { getSessionUser } from '@/lib/auth/session';
import { requireCloudinary } from '@/lib/cloudinary/config';

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: Request): Promise<NextResponse> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return jsonError('Image uploads are not configured on this server.', 503);
    }
    const session = await getSessionUser();
    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return jsonError('Expected file', 400);
    }
    if (file.size > MAX_BYTES) {
      return jsonError('Image is too large (max 3MB).', 400);
    }
    if (!file.type || !ALLOWED.has(file.type)) {
      return jsonError('Use PNG, JPEG, or WebP', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const c = requireCloudinary();

    const safeId = `user_${session.id}`.replace(/[^a-zA-Z0-9_]/g, '');

    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await c.uploader.upload(dataUri, {
      folder: (process.env.CLOUDINARY_AVATAR_FOLDER || 'portfolio/avatars').replace(/^\/|\/$/g, ''),
      overwrite: true,
      public_id: safeId,
      resource_type: 'image',
    });

    if (!result.secure_url) {
      return jsonError('Upload failed', 500);
    }

    return NextResponse.json({ url: result.secure_url as string });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
