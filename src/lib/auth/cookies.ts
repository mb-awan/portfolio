import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAME, MFA_COOKIE_NAME } from '@/lib/auth/constants';

export { AUTH_COOKIE_NAME, MFA_COOKIE_NAME };

const cookieBase = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export function setAuthCookie(token: string): void {
  cookies().set(AUTH_COOKIE_NAME, token, {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(): void {
  cookies().delete(AUTH_COOKIE_NAME);
}

export function setMfaCookie(token: string): void {
  cookies().set(MFA_COOKIE_NAME, token, {
    ...cookieBase,
    maxAge: 600,
  });
}

export function clearMfaCookie(): void {
  cookies().delete(MFA_COOKIE_NAME);
}
