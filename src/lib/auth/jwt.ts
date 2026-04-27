import { SignJWT, jwtVerify } from 'jose';

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error('AUTH_JWT_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
}

export type AuthJwtPayload = { sub: string };

export async function signAuthToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function signMfaPendingToken(userId: string): Promise<string> {
  return new SignJWT({ step: 'mfa_pending', sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(getSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthJwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  const sub = payload.sub as string | undefined;
  if (!sub) {
    throw new Error('Invalid token');
  }
  return { sub };
}

export async function verifyMfaPendingToken(token: string): Promise<{ step: string; sub: string }> {
  const { payload } = await jwtVerify(token, getSecret());
  if (payload.step !== 'mfa_pending') {
    throw new Error('Invalid MFA token');
  }
  const sub = payload.sub as string | undefined;
  if (!sub) {
    throw new Error('Invalid token');
  }
  return { step: 'mfa_pending', sub };
}
