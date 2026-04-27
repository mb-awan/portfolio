import { isCloudinaryConfigured, requireCloudinary } from '@/lib/cloudinary/config';

const CLOUDINARY_HOST = 'res.cloudinary.com';

export function isCloudinaryDeliveryUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === CLOUDINARY_HOST && u.pathname.includes('/image/upload/');
  } catch {
    return false;
  }
}

/**
 * Public ID as stored in Cloudinary (folder path + filename, no file extension).
 * Handles URLs like: https://res.cloudinary.com/{cloud}/image/upload/v123/folder/file.jpg
 */
export function getPublicIdFromCloudinaryUrl(url: string): null | string {
  try {
    const u = new URL(url);
    if (u.hostname !== CLOUDINARY_HOST) {
      return null;
    }
    const decodedPath = decodeURIComponent(u.pathname);
    const marker = '/image/upload/';
    const idx = decodedPath.indexOf(marker);
    if (idx < 0) {
      return null;
    }
    let rest = decodedPath.slice(idx + marker.length);
    if (rest.startsWith('v') && /^v\d+\//.test(rest)) {
      rest = rest.replace(/^v\d+\//, '');
    }
    return rest.replace(/\.(jpe?g|png|webp|gif|avif|svg)$/i, '');
  } catch {
    return null;
  }
}

/**
 * Best-effort delete. Ignores errors (asset may already be gone) so profile flows never fail.
 */
export async function deleteCloudinaryImageByUrl(url: null | string | undefined): Promise<void> {
  if (!url?.trim() || !isCloudinaryConfigured()) {
    return;
  }
  if (!isCloudinaryDeliveryUrl(url)) {
    return;
  }
  const publicId = getPublicIdFromCloudinaryUrl(url);
  if (!publicId) {
    return;
  }
  try {
    const c = requireCloudinary();
    const result = await c.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });
    if (result.result !== 'ok' && result.result !== 'not found') {
      console.warn('Cloudinary destroy result:', publicId, result);
    }
  } catch (e) {
    console.warn('Cloudinary delete failed for', publicId, e);
  }
}

/**
 * When the URL string changes (e.g. new version segment) but the public_id is identical (overwrite upload),
 * we must not destroy the asset. When public IDs differ, delete the old one.
 */
export function shouldDeleteOldImageBeforeStoringNew(params: {
  newImageUrl: string;
  oldImageUrl: null | string;
}): boolean {
  const { newImageUrl, oldImageUrl } = params;
  if (!oldImageUrl) {
    return false;
  }
  if (newImageUrl === oldImageUrl) {
    return false;
  }
  if (!isCloudinaryDeliveryUrl(oldImageUrl)) {
    return false;
  }
  if (isCloudinaryDeliveryUrl(newImageUrl)) {
    const oldId = getPublicIdFromCloudinaryUrl(oldImageUrl);
    const newId = getPublicIdFromCloudinaryUrl(newImageUrl);
    if (oldId && newId && oldId === newId) {
      return false;
    }
  }
  return true;
}
