import { createHash } from 'crypto';
import { createPublicPemFromPrivate } from './utils';
import {
  AuthEnv,
  VerifyEmail,
  BasicRegistrationController,
  RegistrationWithVerificationController,
  VerifyController,
  RefreshController,
  RevokeController,
  AuthorizeController,
  AuthUserModel,
  AuthUser,
  Verify,
  Refresh,
  BasicAuthModule,
  VerifyModel,
  RefreshModel,
  AuthWithValidation,
  BasicAuthAndRefresh,
  CompleteAuth,
  LoginController,
  AuthGuard,
  ActiveUserGuard,
  VerifyToken,
  VerifyJWKS,
} from '../types';

export function generateAuthModuleConfig<U extends AuthUser>(
  config: AuthEnv,
  User: AuthUserModel<U>
): BasicAuthModule<U>;
export function generateAuthModuleConfig<U extends AuthUser, V extends Verify>(
  config: AuthEnv,
  User: AuthUserModel<U>,
  Verify: VerifyModel<V>,
  emailClient: VerifyEmail
): AuthWithValidation<U, V>;
export function generateAuthModuleConfig<U extends AuthUser, R extends Refresh>(
  config: AuthEnv,
  User: AuthUserModel<U>,
  Refresh: RefreshModel<R>
): BasicAuthAndRefresh<U, R>;
export function generateAuthModuleConfig<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(
  config: AuthEnv,
  User: AuthUserModel<U>,
  Verify: VerifyModel<V>,
  emailClient: VerifyEmail,
  Refresh: RefreshModel<R>
): CompleteAuth<U, V, R>;
export function generateAuthModuleConfig<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(
  config: AuthEnv,
  User: AuthUserModel<U>,
  VerifyM?: VerifyModel<V>,
  emailClient?: VerifyEmail,
  RefreshM?: RefreshModel<R>
): any {
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

  const login: LoginController<U> = {
    User,
    ...config.accessToken,
    keyId,
  };
  const baseRegister: BasicRegistrationController<U> = {
    User,
  };

  const baseConfig: BasicAuthModule<U> = {
    authServerHost: config.authServerHost,
    login,
    jwks,
    register: baseRegister,
  };

  if (
    VerifyM === undefined &&
    emailClient === undefined &&
    RefreshM === undefined
  ) {
    return baseConfig;
    //
  } else if (VerifyM && emailClient && RefreshM === undefined) {
    const register: RegistrationWithVerificationController<U, V> = {
      User,
      Verify: VerifyM,
      verifyEmail: emailClient,
    };

    const verify: VerifyController<U, V> = {
      User,
      Verify: VerifyM,
    };

    return { ...baseConfig, register, verify } as AuthWithValidation<U, V>;
    //
  } else if (
    VerifyM === undefined &&
    emailClient === undefined &&
    RefreshM &&
    config.refreshToken
  ) {
    const authorize: AuthorizeController<U, R> = {
      User,
      Refresh: RefreshM,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };
    const refresh: RefreshController<R> = {
      Refresh: RefreshM,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };

    const revoke: RevokeController<R> = {
      Refresh: RefreshM,
    };

    return { ...baseConfig, authorize, refresh, revoke } as BasicAuthAndRefresh<
      U,
      R
    >;

    //
  } else if (VerifyM && RefreshM && emailClient && config.refreshToken) {
    const register: RegistrationWithVerificationController<U, V> = {
      User,
      Verify: VerifyM,
      verifyEmail: emailClient,
    };

    const verify: VerifyController<U, V> = {
      User,
      Verify: VerifyM,
    };

    const authorize: AuthorizeController<U, R> = {
      User,
      Refresh: RefreshM,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };

    const refresh: RefreshController<R> = {
      Refresh: RefreshM,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };

    const revoke: RevokeController<R> = {
      Refresh: RefreshM,
    };

    return {
      ...baseConfig,
      register,
      verify,
      authorize,
      refresh,
      revoke,
    } as CompleteAuth<U, V, R>;
  }

  // default return
  return baseConfig;
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
