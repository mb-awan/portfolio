'use client';

import { type PropsWithChildren, Suspense } from 'react';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

import { AuthModalProvider } from '@/components/auth/auth-modal-context';
import { AuthModals } from '@/components/auth/auth-modals';
import { AuthRouteBridge } from '@/components/auth/auth-route-bridge';
import { SessionProvider } from '@/components/auth/session-me-provider';
import { type PublicUser } from '@/lib/auth/session';

type AppProvidersProps = { initialUser: PublicUser | null } & PropsWithChildren<ThemeProviderProps>;

export function AppProviders({ children, initialUser, ...themeProps }: AppProvidersProps): React.JSX.Element {
  return (
    <ThemeProvider {...themeProps}>
      <SessionProvider initialUser={initialUser}>
        <AuthModalProvider>
          {children}
          <AuthModals />
          <Suspense fallback={null}>
            <AuthRouteBridge />
          </Suspense>
        </AuthModalProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
