import { Types } from 'mongoose';

import { formatAddressSummary, profileFieldsFromUser } from '@/lib/user/profile-response';

type LeanUserWithTimestamps = {
  _id: Types.ObjectId;
  createdAt?: Date;
  email: string;
  emailVerified: boolean;
  imageUrl?: null | string;
  name: string;
  role?: unknown;
  tfaEnabled?: boolean;
  updatedAt?: Date;
} & Record<string, unknown>;

export function mapRoleSummary(role: unknown): { id: string; name?: string; slug?: string } | null {
  if (role && typeof role === 'object' && '_id' in role) {
    return {
      id: (role._id as Types.ObjectId).toString(),
      name: (role as { name?: string }).name,
      slug: (role as { slug?: string }).slug,
    };
  }
  return null;
}

export function mapAdminUserListItem(u: LeanUserWithTimestamps): {
  addressSummary: string;
  bio: string;
  createdAt?: string;
  email: string;
  emailVerified: boolean;
  gender: string;
  id: string;
  imageUrl: null | string;
  name: string;
  phone: string;
  profileCompletionPercent: number;
  role: { id: string; name?: string; slug?: string } | null;
} {
  const profile = profileFieldsFromUser(u);
  return {
    addressSummary: formatAddressSummary(profile.address),
    bio: profile.bio,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : undefined,
    email: u.email,
    emailVerified: u.emailVerified,
    gender: profile.gender,
    id: u._id.toString(),
    imageUrl: u.imageUrl ?? null,
    name: u.name,
    phone: profile.phone,
    profileCompletionPercent: profile.profileCompletionPercent,
    role: mapRoleSummary(u.role),
  };
}

export function mapAdminUserDetail(u: LeanUserWithTimestamps): {
  address: ReturnType<typeof profileFieldsFromUser>['address'];
  addressSummary: string;
  bio: string;
  businessDetails: ReturnType<typeof profileFieldsFromUser>['businessDetails'];
  createdAt?: string;
  education: ReturnType<typeof profileFieldsFromUser>['education'];
  email: string;
  emailVerified: boolean;
  experience: ReturnType<typeof profileFieldsFromUser>['experience'];
  gender: ReturnType<typeof profileFieldsFromUser>['gender'];
  id: string;
  imageUrl: null | string;
  name: string;
  phone: string;
  profileCompletionPercent: number;
  role: { description?: string; id: string; name?: string; slug?: string } | null;
  socialLinks: ReturnType<typeof profileFieldsFromUser>['socialLinks'];
  tfaEnabled: boolean;
  updatedAt?: string;
} {
  const profile = profileFieldsFromUser(u);
  const roleRaw = u.role;
  let role: { description?: string; id: string; name?: string; slug?: string } | null = null;
  if (roleRaw && typeof roleRaw === 'object' && '_id' in roleRaw) {
    role = {
      description: (roleRaw as { description?: string }).description,
      id: (roleRaw._id as Types.ObjectId).toString(),
      name: (roleRaw as { name?: string }).name,
      slug: (roleRaw as { slug?: string }).slug,
    };
  }
  return {
    ...profile,
    addressSummary: formatAddressSummary(profile.address),
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : undefined,
    email: u.email,
    emailVerified: u.emailVerified,
    id: u._id.toString(),
    imageUrl: u.imageUrl ?? null,
    name: u.name,
    role,
    tfaEnabled: !!u.tfaEnabled,
    updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : undefined,
  };
}
