import type { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.AUTH_JWT_SECRET;
  const { pathname } = request.nextUrl;

  async function isAuthed(): Promise<boolean> {
    if (!secret) {
      return false;
    }
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return false;
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return true;
    } catch {
      return false;
    }
  }

  if (pathname.startsWith('/profile')) {
    if (!(await isAuthed())) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth', 'signIn');
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/auth') && (await isAuthed())) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/auth/:path*'],
};
