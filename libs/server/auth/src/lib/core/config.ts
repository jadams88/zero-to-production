import { createHash } from 'crypto';
import { createPublicPemFromPrivate, noOpEmailVerification } from './utils';
import {
  AuthEnv,
  VerifyEmail,
  AuthUserModel,
  AuthUser,
  Verify,
  Refresh,
  VerifyModel,
  RefreshModel,
  AuthGuard,
  ActiveUserGuard,
  VerifyToken,
  VerifyJWKS,
  AuthModuleConfig,
} from '../types';

export function generateAuthModuleConfig<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(
  config: AuthEnv,
  User: AuthUserModel<U>,
  RefreshM: RefreshModel<R>,
  VerifyM: VerifyModel<V>,
  emailClient: VerifyEmail = noOpEmailVerification
): AuthModuleConfig<U, R, V> {
  const { publicKey, privateKey } = config.accessToken;
  const pubKey = publicKey ? publicKey : createPublicPemFromPrivate(privateKey);

  // The KeyId is used to retrieve the appropriate public key from a JWKS.
  // There structure of the key is unspecified (https://tools.ietf.org/html/rfc7517#section-4.5)
  // It is common practice to generate a UUID or similar as the key, however this
  // will not work in a scenario such as a cloud functions (lambda) or in K8s
  // where they can be any number of containers. So create a hash from public
  // key as the keyId
  const keyId = createHash('md5').update(pubKey).digest('hex');

  const jwks = config.jwksRoute
    ? {
        publicKey: pubKey,
        keyId,
      }
    : undefined;

  return {
    authServerHost: config.authServerHost,
    jwks,
    register: {
      User,
      Verify: VerifyM,
      verifyEmail: emailClient,
    },
    verify: {
      User,
      Verify: VerifyM,
    },
    authorize: {
      User,
      Refresh: RefreshM,
      ...config.accessToken,
      keyId,
    },
    refresh: {
      Refresh: RefreshM,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    },
    revoke: {
      Refresh: RefreshM,
    },
  };
}

export function generateAuthGuardConfig<U extends AuthUser>(
  authConfig: AuthEnv,
  User: AuthUserModel<U>,
  production: boolean = false
): AuthGuard<U> {
  const activeUser: ActiveUserGuard<U> = { User };
  let auth: VerifyToken | VerifyJWKS;

  if (authConfig.accessToken.publicKey) {
    // The public key is provide, so do not need a JWKS
    auth = {
      issuer: authConfig.accessToken.issuer,
      audience: authConfig.accessToken.audience,
      publicKey: authConfig.accessToken.publicKey,
    } as VerifyToken;
  } else {
    auth = {
      allowHttp: production,
      authServerHost: authConfig.authServerHost,
      issuer: authConfig.accessToken.issuer,
      audience: authConfig.accessToken.audience,
    } as VerifyJWKS;
  }
  return {
    authenticate: auth,
    activeUser,
  };
}
