'use client';

import { useSessionMeContext } from '@/components/auth/session-me-provider';
import { type SessionMe } from '@/lib/auth/session-me-types';

export type { SessionMe } from '@/lib/auth/session-me-types';

export function useSessionMe(): {
  me: SessionMe | null;
  refresh: () => void;
} {
  return useSessionMeContext();
}
