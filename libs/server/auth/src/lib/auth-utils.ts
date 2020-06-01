import { createPublicKey, createHash } from 'crypto';
// @ts-ignore
import omit from 'lodash.omit';
import { IUserModel } from '@ztp/server/core-data';
import { ServerConfig } from '@ztp/data';
import {
  JWKSGuarConfig,
  GuardConfig,
  LoginAndRegisterConfig,
  AuthWithRefreshTokenConfig,
  ServerAuthConfig,
  IVerificationTokenModel,
  IRefreshTokenModel,
  AuthModuleConfig,
  VerifyEmail,
} from './auth.interface';

export function isPasswordAllowed(password: string): boolean {
  return (
    !!password &&
    password.length > 8 &&
    /\d/.test(password) &&
    /\D/.test(password) &&
    /[@$!%*#?&]/.test(password)
  );
}

export function userToJSON<T>(user: T): T {
  return omit(user, ['hashedPassword', 'password']);
}

export function isJWKS(
  config: JWKSGuarConfig | GuardConfig
): config is JWKSGuarConfig {
  return (config as GuardConfig).publicKey === undefined;
}

export function isRefreshConfig(
  config: LoginAndRegisterConfig | AuthWithRefreshTokenConfig
): config is AuthWithRefreshTokenConfig {
  return (config as AuthWithRefreshTokenConfig).authorize !== undefined;
}

export function generateAuthGuardConfig(
  config: ServerConfig,
  authConfig: ServerAuthConfig,
  User: IUserModel
): GuardConfig | JWKSGuarConfig {
  if (authConfig.accessToken.publicKey) {
    // The public key is provide, so do not need a JWKS
    return {
      User,
      issuer: authConfig.accessToken.issuer,
      audience: authConfig.accessToken.audience,
      publicKey: authConfig.accessToken.publicKey,
    };
  } else {
    return {
      User,
      production: config.production,
      authServerUrl: authConfig.authServerUrl,
      issuer: authConfig.accessToken.issuer,
      audience: authConfig.accessToken.audience,
    };
  }
}

// A no-op placeholder function for if no email verification is provided
export const noOpEmailVerification: VerifyEmail = async (to, token) =>
  Promise.resolve([undefined, {}]);

export function generateAuthModuleConfig(
  User: IUserModel,
  VerificationToken: IVerificationTokenModel,
  RefreshToken: IRefreshTokenModel,
  config: ServerAuthConfig,
  email?: VerifyEmail
): AuthModuleConfig {
  const { publicKey, privateKey } = config.accessToken;
  const pubKey = publicKey ? publicKey : createPublicPemFromPrivate(privateKey);

  // The KeyId is used to retrieve the appropriate public key from a JWKS.
  // There structure of the key is unspecified (https://tools.ietf.org/html/rfc7517#section-4.5)
  // It is common practice to generate a UUID or similar as the key, however this
  // will not work in a scenario such as a cloud functions (lambda) or in K8s
  // where they can be any number of containers. So create a hash from public
  // key as the keyId
  const keyId = createHash('md5').update(pubKey).digest('hex');

  return {
    jwks: config.jwksRoute
      ? {
          publicKey: pubKey,
          keyId,
        }
      : undefined,
    login: { User, ...config.accessToken, keyId },
    register: { User, VerificationToken, ...config.accessToken },
    verify: { User, VerificationToken, ...config.accessToken },
    authorize: {
      User,
      RefreshToken,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    },
    refresh: {
      RefreshToken,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    },
    revoke: { RefreshToken },
    email: email ? email : noOpEmailVerification,
  };
}

export function createPublicPemFromPrivate(privateKey: string) {
  const publicPem = createPublicKey(privateKey);

  return publicPem.export({ format: 'pem', type: 'spki' }) as string;
}
