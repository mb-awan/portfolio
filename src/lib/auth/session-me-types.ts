import { type PublicUser } from '@/lib/auth/session';

export type SessionMe = {
  bio?: string;
  email: string;
  emailVerified?: boolean;
  id: string;
  imageUrl?: null | string;
  name: string;
  permissions?: string[];
  roleSlug?: null | string;
  tfaEnabled?: boolean;
};

export function publicUserToSessionMe(u: PublicUser | null): SessionMe | null {
  if (!u) {
    return null;
  }
  return {
    bio: u.bio,
    email: u.email,
    emailVerified: u.emailVerified,
    id: u.id,
    imageUrl: u.imageUrl,
    name: u.name,
    permissions: u.permissions,
    roleSlug: u.roleSlug,
    tfaEnabled: u.tfaEnabled,
  };
}
