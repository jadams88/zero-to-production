import { createPublicKey } from 'crypto';
// @ts-ignore
import omit from 'lodash.omit';
import {
  VerifyToken,
  VerifyJWKS,
  BasicRegistrationController,
  RegistrationWithVerificationController,
  WithRefresh,
  WithoutRefresh,
  AuthUser,
  Verify,
  Refresh,
} from '../types';

export function isPasswordAllowed(password: string): boolean {
  return (
    !!password &&
    password.length > 8 &&
    /\d/.test(password) &&
    /\D/.test(password) &&
    /[@$!%*#?&]/.test(password)
  );
}

export function stripPasswordFields<T>(user: T): T {
  return omit(user, ['hashedPassword', 'password']);
}

export function createPublicPemFromPrivate(privateKey: string) {
  const publicKey = createPublicKey(privateKey);

  return publicKey.export({ format: 'pem', type: 'spki' }) as string;
}

export function createEmailMessage(
  creatLink: (email: string, token: string) => string
) {
  return (email: string, token: string) => {
    return {
      to: email,
      from: 'register@zero-to-production.com',
      subject: 'Verify Your Email',
      text: `Click on the link to verify your email ${creatLink(email, token)}`,
    };
  };
}

export function isJWKS(
  config: VerifyToken | VerifyJWKS
): config is VerifyToken {
  return (config as VerifyJWKS).authServerHost === undefined;
}

export function includeRefresh<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(
  config: WithRefresh<U, V, R> | WithoutRefresh<U, V>
): config is WithRefresh<U, V, R> {
  return (config as WithRefresh<U, V, R>).authorize !== undefined;
}

export function includeEmailVerification<U extends AuthUser, V extends Verify>(
  config:
    | BasicRegistrationController<U>
    | RegistrationWithVerificationController<U, V>
): config is RegistrationWithVerificationController<U, V> {
  return (
    (config as RegistrationWithVerificationController<U, V>).Verify !==
    undefined
  );
}
