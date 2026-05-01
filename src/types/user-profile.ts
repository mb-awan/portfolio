export type BusinessDetails = {
  companyName: string;
  description: string;
  industry: string;
  role: string;
  website: string;
};

export const EMPTY_BUSINESS_DETAILS: BusinessDetails = {
  companyName: '',
  description: '',
  industry: '',
  role: '',
  website: '',
};

export type PostalAddress = {
  city: string;
  country: string;
  district: string;
  province: string;
  zipCode: string;
};

export const EMPTY_POSTAL_ADDRESS: PostalAddress = {
  city: '',
  country: '',
  district: '',
  province: '',
  zipCode: '',
};

/** Stored values; labels come from `SOCIAL_PLATFORM_OPTIONS` */
export type SocialPlatform =
  | 'behance'
  | 'dribbble'
  | 'facebook'
  | 'github'
  | 'instagram'
  | 'linkedin'
  | 'medium'
  | 'other'
  | 'tiktok'
  | 'twitter'
  | 'website'
  | 'youtube';

export type SocialLink = {
  platform: SocialPlatform | string;
  url: string;
};

export type Gender = '' | 'female' | 'male' | 'non_binary' | 'other' | 'prefer_not_say';

export type EducationEntry = {
  degree: string;
  endYear?: number;
  field: string;
  institution: string;
  notes: string;
  startYear?: number;
};

export type ExperienceEntry = {
  company: string;
  description: string;
  employmentType: string;
  endDate: string;
  location: string;
  startDate: string;
  title: string;
};
