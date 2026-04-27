import { NextResponse } from 'next/server';

import { clearAuthCookie, clearMfaCookie } from '@/lib/auth/cookies';

export async function POST(): Promise<NextResponse> {
  clearAuthCookie();
  clearMfaCookie();
  return NextResponse.json({ ok: true });
}
