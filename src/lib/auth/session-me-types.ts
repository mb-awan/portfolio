import type {
  BusinessDetails,
  EducationEntry,
  ExperienceEntry,
  Gender,
  PostalAddress,
  SocialLink,
} from '@/types/user-profile';

import { type PublicUser } from '@/lib/auth/session';

export type SessionMe = {
  address?: PostalAddress;
  bio?: string;
  businessDetails?: BusinessDetails | null;
  education?: EducationEntry[];
  email: string;
  emailVerified?: boolean;
  experience?: ExperienceEntry[];
  gender?: Gender | string;
  id: string;
  imageUrl?: null | string;
  name: string;
  permissions?: string[];
  phone?: string;
  profileCompletionPercent?: number;
  roleSlug?: null | string;
  socialLinks?: SocialLink[];
  tfaEnabled?: boolean;
};

export function publicUserToSessionMe(u: PublicUser | null): SessionMe | null {
  if (!u) {
    return null;
  }
  return {
    address: u.address,
    bio: u.bio,
    businessDetails: u.businessDetails,
    education: u.education,
    email: u.email,
    emailVerified: u.emailVerified,
    experience: u.experience,
    gender: u.gender,
    id: u.id,
    imageUrl: u.imageUrl,
    name: u.name,
    permissions: u.permissions,
    phone: u.phone,
    profileCompletionPercent: u.profileCompletionPercent,
    roleSlug: u.roleSlug,
    socialLinks: u.socialLinks,
    tfaEnabled: u.tfaEnabled,
  };
}
