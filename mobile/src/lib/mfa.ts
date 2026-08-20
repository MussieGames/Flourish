import {
  getMultiFactorResolver,
  multiFactor,
  TotpMultiFactorGenerator,
  type MultiFactorResolver,
  type TotpSecret,
  type User,
} from 'firebase/auth';
import { auth } from '@/firebase/config';

export type { TotpSecret } from 'firebase/auth';

export class MfaRequiredError extends Error {
  readonly resolver: MultiFactorResolver;

  constructor(resolver: MultiFactorResolver) {
    super('MFA_REQUIRED');
    this.name = 'MfaRequiredError';
    this.resolver = resolver;
  }
}

export function isMfaRequiredError(error: unknown): error is MfaRequiredError {
  return error instanceof MfaRequiredError;
}

export function resolverFromAuthError(error: unknown): MultiFactorResolver | null {
  if (!error || typeof error !== 'object' || !('code' in error)) return null;
  if (String((error as { code: unknown }).code) !== 'auth/multi-factor-auth-required') return null;
  try {
    return getMultiFactorResolver(auth, error as Parameters<typeof getMultiFactorResolver>[1]);
  } catch {
    return null;
  }
}

export function totpEnrollment(user: User | null): { enrolled: boolean; uid?: string } {
  if (!user) return { enrolled: false };
  try {
    const factor = multiFactor(user).enrolledFactors.find(
      (f) => f.factorId === TotpMultiFactorGenerator.FACTOR_ID,
    );
    return { enrolled: Boolean(factor), uid: factor?.uid };
  } catch {
    return { enrolled: false };
  }
}

export async function startTotpEnrollment(user: User): Promise<TotpSecret> {
  const session = await multiFactor(user).getSession();
  return TotpMultiFactorGenerator.generateSecret(session);
}

export async function finishTotpEnrollment(
  user: User,
  secret: TotpSecret,
  code: string,
): Promise<void> {
  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, code.trim());
  await multiFactor(user).enroll(assertion, 'Authenticator');
}

export async function unenrollTotp(user: User): Promise<void> {
  const mfaUser = multiFactor(user);
  const factor = mfaUser.enrolledFactors.find((f) => f.factorId === TotpMultiFactorGenerator.FACTOR_ID);
  if (!factor) return;
  await mfaUser.unenroll(factor);
}

export async function completeTotpSignIn(resolver: MultiFactorResolver, code: string): Promise<void> {
  const hint = resolver.hints.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID);
  if (!hint) throw new Error('No authenticator is enrolled on this account.');
  const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code.trim());
  await resolver.resolveSignIn(assertion);
}
