import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const first = error.issues[0]?.message ?? 'Invalid input';
    return NextResponse.json({ error: first }, { status: 400 });
  }
  const message = error instanceof Error ? error.message : 'Something went wrong';
  return NextResponse.json({ error: message }, { status: 500 });
}
