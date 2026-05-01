import type { SocialPlatform } from '@/types/user-profile';

export const SOCIAL_PLATFORM_OPTIONS: readonly { label: string; value: SocialPlatform }[] = [
  { label: 'Website', value: 'website' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'GitHub', value: 'github' },
  { label: 'X (Twitter)', value: 'twitter' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Medium', value: 'medium' },
  { label: 'Dribbble', value: 'dribbble' },
  { label: 'Behance', value: 'behance' },
  { label: 'Other', value: 'other' },
] as const;

export function socialPlatformLabel(platform: string): string {
  const found = SOCIAL_PLATFORM_OPTIONS.find((o) => o.value === platform);
  return found?.label ?? platform;
}
