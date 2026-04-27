'use client';

import { useEffect, useRef } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { type AuthModalView, useAuthModal } from '@/components/auth/auth-modal-context';

const pathToView: Record<string, AuthModalView> = {
  '/auth/forgot-password': 'forgotPassword',
  '/auth/login': 'signIn',
  '/auth/register': 'signUp',
  '/auth/reset-password': 'resetPassword',
  '/auth/verify-email': 'verifyEmail',
  '/auth/verify-tfa': 'verifyTfa',
};

const queryToView: Record<string, AuthModalView> = {
  account: 'account',
  'forgot-password': 'forgotPassword',
  register: 'signUp',
  'reset-password': 'resetPassword',
  signIn: 'signIn',
  signUp: 'signUp',
  'verify-email': 'verifyEmail',
  'verify-tfa': 'verifyTfa',
};

export function AuthRouteBridge(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { open } = useAuthModal();
  const skipNextQuery = useRef(false);

  useEffect(() => {
    if (skipNextQuery.current) {
      skipNextQuery.current = false;
      return;
    }

    const v = pathToView[pathname];
    if (v) {
      const from = searchParams.get('from') ?? undefined;
      const email = searchParams.get('email') ?? undefined;
      open(v, { email, fromPath: from });
      skipNextQuery.current = true;
      router.replace('/', { scroll: false });
      return;
    }

    const q = searchParams.get('auth');
    if (q && queryToView[q]) {
      const from = searchParams.get('from') ?? undefined;
      const email = searchParams.get('email') ?? undefined;
      open(queryToView[q], { email, fromPath: from });
      const p = new URLSearchParams(searchParams.toString());
      p.delete('auth');
      p.delete('email');
      p.delete('from');
      const s = p.toString();
      skipNextQuery.current = true;
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    }
  }, [open, pathname, router, searchParams]);

  return null;
}
