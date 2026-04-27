'use client';

import { type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { type PublicUser } from '@/lib/auth/session';
import { type SessionMe, publicUserToSessionMe } from '@/lib/auth/session-me-types';

type SessionMeContextValue = {
  me: SessionMe | null;
  refresh: () => void;
};

const SessionMeContext = createContext<SessionMeContextValue | null>(null);

type SessionProviderProps = PropsWithChildren<{
  initialUser: PublicUser | null;
}>;

export function SessionProvider({ children, initialUser }: SessionProviderProps): React.JSX.Element {
  const [me, setMe] = useState<SessionMe | null>(publicUserToSessionMe(initialUser));

  const refresh = useCallback(() => {
    void fetch('/api/user/me')
      .then(async (r) => {
        if (r.status === 401) {
          return null;
        }
        if (!r.ok) {
          return null;
        }
        return (await r.json()) as SessionMe;
      })
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  const value = useMemo(() => ({ me, refresh }), [me, refresh]);

  return <SessionMeContext.Provider value={value}>{children}</SessionMeContext.Provider>;
}

export function useSessionMeContext(): SessionMeContextValue {
  const ctx = useContext(SessionMeContext);
  if (!ctx) {
    throw new Error('useSessionMeContext must be used within SessionProvider');
  }
  return ctx;
}
