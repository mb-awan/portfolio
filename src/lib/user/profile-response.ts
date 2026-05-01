import type {
  BusinessDetails,
  EducationEntry,
  ExperienceEntry,
  Gender,
  PostalAddress,
  SocialLink,
} from '@/types/user-profile';

import { EMPTY_POSTAL_ADDRESS } from '@/types/user-profile';

import { computeProfileCompletion } from '@/lib/user/profile-completion';

type LeanUser = {
  _id: { toString: () => string };
  address?: PostalAddress | Record<string, unknown>;
  bio?: string;
  businessDetails?: BusinessDetails | null;
  education?: EducationEntry[];
  email: string;
  emailVerified: boolean;
  experience?: ExperienceEntry[];
  gender?: Gender | string;
  imageUrl?: null | string;
  location?: string;
  name: string;
  phone?: string;
  socialLinks?: SocialLink[];
  tfaEnabled: boolean;
} & Record<string, unknown>;

function normalizeEducation(raw: unknown): EducationEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => {
    const e = item as Record<string, unknown>;
    return {
      degree: typeof e.degree === 'string' ? e.degree : '',
      endYear: typeof e.endYear === 'number' ? e.endYear : undefined,
      field: typeof e.field === 'string' ? e.field : '',
      institution: typeof e.institution === 'string' ? e.institution : '',
      notes: typeof e.notes === 'string' ? e.notes : '',
      startYear: typeof e.startYear === 'number' ? e.startYear : undefined,
    };
  });
}

function normalizeExperience(raw: unknown): ExperienceEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => {
    const e = item as Record<string, unknown>;
    return {
      company: typeof e.company === 'string' ? e.company : '',
      description: typeof e.description === 'string' ? e.description : '',
      employmentType: typeof e.employmentType === 'string' ? e.employmentType : '',
      endDate: typeof e.endDate === 'string' ? e.endDate : '',
      location: typeof e.location === 'string' ? e.location : '',
      startDate: typeof e.startDate === 'string' ? e.startDate : '',
      title: typeof e.title === 'string' ? e.title : '',
    };
  });
}

function normalizeBusiness(raw: unknown): BusinessDetails | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const b = raw as Record<string, unknown>;
  const out: BusinessDetails = {
    companyName: typeof b.companyName === 'string' ? b.companyName : '',
    description: typeof b.description === 'string' ? b.description : '',
    industry: typeof b.industry === 'string' ? b.industry : '',
    role: typeof b.role === 'string' ? b.role : '',
    website: typeof b.website === 'string' ? b.website : '',
  };
  const nonEmpty = Object.values(out).some((v) => typeof v === 'string' && v.trim().length > 0);
  return nonEmpty ? out : null;
}

function normalizeAddress(raw: unknown, legacyLocation?: string): PostalAddress {
  const base: PostalAddress = { ...EMPTY_POSTAL_ADDRESS };
  if (raw && typeof raw === 'object') {
    const a = raw as Record<string, unknown>;
    base.city = typeof a.city === 'string' ? a.city : '';
    base.country = typeof a.country === 'string' ? a.country : '';
    base.district = typeof a.district === 'string' ? a.district : '';
    base.province = typeof a.province === 'string' ? a.province : '';
    base.zipCode = typeof a.zipCode === 'string' ? a.zipCode : '';
  }
  const hasStructured = Object.values(base).some((v) => v.trim().length > 0);
  if (!hasStructured && legacyLocation?.trim()) {
    base.city = legacyLocation.trim();
  }
  return base;
}

function normalizeGender(raw: unknown): Gender | string {
  const g = typeof raw === 'string' ? raw : '';
  if (g === '' || g === 'female' || g === 'male' || g === 'non_binary' || g === 'other' || g === 'prefer_not_say') {
    return g;
  }
  return '';
}

function normalizeSocialLinks(raw: unknown): SocialLink[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => {
      const o = item as Record<string, unknown>;
      const platform = typeof o.platform === 'string' ? o.platform.trim() : '';
      const url = typeof o.url === 'string' ? o.url.trim() : '';
      return { platform, url };
    })
    .filter((l) => l.platform.length > 0 || l.url.length > 0);
}

export type ProfileJsonFields = {
  address: PostalAddress;
  bio: string;
  businessDetails: BusinessDetails | null;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  gender: Gender | string;
  phone: string;
  profileCompletionPercent: number;
  socialLinks: SocialLink[];
};

export function formatAddressSummary(a: PostalAddress): string {
  const segments = [a.city, a.district, a.province, a.country].filter((s) => s.trim().length > 0);
  const core = segments.join(', ');
  if (a.zipCode.trim()) {
    return core ? `${core} · ${a.zipCode.trim()}` : a.zipCode.trim();
  }
  return core;
}

export function profileFieldsFromUser(user: LeanUser | Record<string, unknown>): ProfileJsonFields {
  const u = user as LeanUser;
  const legacyLoc = typeof u.location === 'string' ? u.location : undefined;
  const address = normalizeAddress(u.address, legacyLoc);
  const bio = u.bio ?? '';
  const businessDetails = normalizeBusiness(u.businessDetails);
  const education = normalizeEducation(u.education);
  const experience = normalizeExperience(u.experience);
  const gender = normalizeGender(u.gender);
  const phone = typeof u.phone === 'string' ? u.phone : '';
  const socialLinks = normalizeSocialLinks(u.socialLinks);

  const profileCompletionPercent = computeProfileCompletion({
    address,
    bio,
    businessDetails,
    education,
    emailVerified: !!u.emailVerified,
    experience,
    gender,
    imageUrl: u.imageUrl ?? null,
    phone,
    socialLinks,
  });

  return {
    address,
    bio,
    businessDetails,
    education,
    experience,
    gender,
    phone,
    profileCompletionPercent,
    socialLinks,
  };
}

export function emptyEducationRow(): EducationEntry {
  return { degree: '', field: '', institution: '', notes: '' };
}

export function emptyExperienceRow(): ExperienceEntry {
  return {
    company: '',
    description: '',
    employmentType: '',
    endDate: '',
    location: '',
    startDate: '',
    title: '',
  };
}

export function emptySocialLink(): SocialLink {
  return { platform: 'website', url: '' };
}
