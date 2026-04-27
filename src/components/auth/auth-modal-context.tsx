'use client';

import { type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from 'react';

export type AuthModalView =
  | 'account'
  | 'forgotPassword'
  | 'resetPassword'
  | 'signIn'
  | 'signUp'
  | 'verifyEmail'
  | 'verifyTfa';

type OpenOptions = {
  email?: string;
  fromPath?: string;
};

type AuthModalContextValue = {
  close: () => void;
  email: string;
  fromPath: string;
  open: (view: AuthModalView, options?: OpenOptions) => void;
  setAuthEmail: (v: string) => void;
  setFromPath: (v: string) => void;
  view: AuthModalView | null;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [view, setView] = useState<AuthModalView | null>(null);
  const [email, setAuthEmail] = useState('');
  const [fromPath, setFromPath] = useState('/');

  const open = useCallback((next: AuthModalView, options?: OpenOptions) => {
    if (options?.email !== undefined) {
      setAuthEmail(options.email);
    }
    if (options?.fromPath !== undefined) {
      setFromPath(options.fromPath.startsWith('/') ? options.fromPath : `/${options.fromPath}`);
    }
    setView(next);
  }, []);

  const close = useCallback(() => {
    setView(null);
  }, []);

  const value = useMemo(
    () => ({
      close,
      email,
      fromPath,
      open,
      setAuthEmail,
      setFromPath,
      view,
    }),
    [close, email, fromPath, open, view]
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return ctx;
}
