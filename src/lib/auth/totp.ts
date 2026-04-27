import { generateSecret, generateURI, verifySync } from 'otplib';

/** ±30s window (one default TOTP step) for clock skew */
const EPOCH_TOLERANCE_SEC = 30;

export function createTotpSecret(): string {
  return generateSecret();
}

export function totpProvisioningUri(params: { email: string; issuer: string; secret: string }): string {
  return generateURI({
    issuer: params.issuer,
    label: params.email,
    secret: params.secret,
  });
}

export function verifyTotpToken(secret: string, token: string): boolean {
  return verifySync({
    epochTolerance: EPOCH_TOLERANCE_SEC,
    secret,
    token,
  }).valid;
}
