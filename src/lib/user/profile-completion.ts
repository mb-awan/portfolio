import type {
  BusinessDetails,
  EducationEntry,
  ExperienceEntry,
  Gender,
  PostalAddress,
  SocialLink,
} from '@/types/user-profile';

function hasBusinessContent(b: BusinessDetails | null): boolean {
  if (!b) {
    return false;
  }
  return Object.values(b).some((v) => typeof v === 'string' && v.trim().length > 0);
}

function hasEducationEntry(e: EducationEntry): boolean {
  return (
    [e.institution, e.degree, e.field, e.notes].some((s) => s.trim().length > 0) ||
    e.startYear != null ||
    e.endYear != null
  );
}

function hasExperienceEntry(e: ExperienceEntry): boolean {
  return [e.title, e.company, e.description, e.location, e.startDate, e.endDate, e.employmentType].some(
    (s) => s.trim().length > 0
  );
}

function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  if (t.length < 4) {
    return false;
  }
  try {
    const u = new URL(t.startsWith('http') ? t : `https://${t}`);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Weighted completion score (0–100). Same rules used on the server for API responses.
 */
export function computeProfileCompletion(params: {
  address: PostalAddress;
  bio: string;
  businessDetails: BusinessDetails | null;
  education: EducationEntry[];
  emailVerified: boolean;
  experience: ExperienceEntry[];
  gender: Gender | string;
  imageUrl: null | string;
  phone: string;
  socialLinks: SocialLink[];
}): number {
  let score = 0;

  if (params.emailVerified) {
    score += 12;
  }
  if (params.phone.trim().length >= 7) {
    score += 10;
  }

  const a = params.address;
  if (a.city.trim()) {
    score += 5;
  }
  if (a.district.trim()) {
    score += 4;
  }
  if (a.province.trim()) {
    score += 4;
  }
  if (a.country.trim()) {
    score += 5;
  }
  if (a.zipCode.trim()) {
    score += 4;
  }

  const g = params.gender;
  if (g && g !== '' && g !== 'prefer_not_say') {
    score += 8;
  } else if (g && g !== '') {
    score += 4;
  }

  if (params.bio.trim().length >= 24) {
    score += 8;
  } else if (params.bio.trim().length > 0) {
    score += 4;
  }

  if (params.imageUrl) {
    score += 8;
  }

  if (params.education.some(hasEducationEntry)) {
    score += 8;
  }
  if (params.experience.some(hasExperienceEntry)) {
    score += 8;
  }
  if (hasBusinessContent(params.businessDetails)) {
    score += 6;
  }

  const validSocial = params.socialLinks.some((l) => l.url.trim().length > 0 && looksLikeUrl(l.url));
  if (validSocial) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}
