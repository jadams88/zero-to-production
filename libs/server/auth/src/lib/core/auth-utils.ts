import { createPublicKey, createHash } from 'crypto';
// @ts-ignore
import omit from 'lodash.omit';
import {
  VerifyToken,
  VerifyTokenJWKS,
  ServerAuthConfig,
  VerifyEmail,
  BasicRegistrationControllerConfig,
  RegistrationWithVerificationConftrollerConfig,
  VerifyControllerConfig,
  RefreshControllerConfig,
  RevokeControllerConfig,
  AuthorizeControllerConfig,
  AuthModuleConfig,
  IncludeRefresh,
  ExcludeRefresh,
  UserModel,
  AuthUser,
  Verify,
  Refresh,
  BasicAuthModule,
  VerifyModel,
  RefreshModel,
  AuthWithValidation,
  BasicAuthWithRefresh,
  AuthWithRefresh,
  LoginControllerConfig,
  AuthGuard,
  ActiveUserGuard,
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

export function generateAuthGuardConfig<U extends AuthUser>(
  authConfig: ServerAuthConfig,
  User: UserModel<U>,
  production: boolean = false
): AuthGuard<U> {
  const activeUser: ActiveUserGuard<U> = { User };
  let auth: VerifyToken | VerifyTokenJWKS;

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
      authServerUrl: authConfig.authServerUrl,
      issuer: authConfig.accessToken.issuer,
      audience: authConfig.accessToken.audience,
    } as VerifyTokenJWKS;
  }
  return {
    authenticate: auth,
    activeUser,
  };
}

export function generateAuthModuleConfig<U extends AuthUser>(
  config: ServerAuthConfig,
  User: UserModel<U>
): BasicAuthModule<U>;
export function generateAuthModuleConfig<U extends AuthUser, V extends Verify>(
  config: ServerAuthConfig,
  User: UserModel<U>,
  Verify: VerifyModel<V>,
  emailClient: VerifyEmail
): AuthWithValidation<U, V>;
export function generateAuthModuleConfig<U extends AuthUser, R extends Refresh>(
  config: ServerAuthConfig,
  User: UserModel<U>,
  Refresh: RefreshModel<R>
): BasicAuthWithRefresh<U, R>;
export function generateAuthModuleConfig<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(
  config: ServerAuthConfig,
  User: UserModel<U>,
  Verify: VerifyModel<V>,
  emailClient: VerifyEmail,
  Refresh: RefreshModel<R>
): AuthWithRefresh<U, V, R>;
export function generateAuthModuleConfig<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(
  config: ServerAuthConfig,
  User: UserModel<U>,
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

  // if (config.jwksRoute) {
  //   moduleConfig.jwks = {
  //     publicKey: pubKey,
  //     keyId,
  //   };
  // }

  // moduleConfig.login = {
  //   User,
  //   ...config.accessToken,
  //   keyId,
  // };

  const jwks = config.jwksRoute
    ? {
        publicKey: pubKey,
        keyId,
      }
    : undefined;

  const login: LoginControllerConfig<U> = {
    User,
    ...config.accessToken,
    keyId,
  };

  const baseConfig: AuthModuleConfig<U, V, R> = {
    authServerUrl: config.authServerUrl,
    login,
    jwks,
  } as AuthModuleConfig<U, V, R>;

  if (
    VerifyM === undefined &&
    emailClient === undefined &&
    RefreshM === undefined
  ) {
    const register = {
      User,
    };

    return { ...baseConfig, register } as BasicAuthModule<U>;
  } else if (VerifyM && emailClient && RefreshM === undefined) {
    const register: RegistrationWithVerificationConftrollerConfig<U, V> = {
      User,
      Verify: VerifyM,
      verifyEmail: emailClient,
    };

    const verify: VerifyControllerConfig<U, V> = {
      User,
      Verify: VerifyM,
    };

    const authWithValidation: AuthWithValidation<U, V> = {
      jwks,
      login,
      register,
      authServerUrl: config.authServerUrl,
      verify,
    };
    // const configWithVal;

    return authWithValidation;
  } else if (VerifyM === undefined && emailClient === undefined && RefreshM) {
    const register: BasicRegistrationControllerConfig<U> = {
      User,
    };

    const authorize: AuthorizeControllerConfig<U, R> = {
      User,
      Refresh: RefreshM,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };
    const refresh: RefreshControllerConfig<R> = {
      Refresh: RefreshM,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };

    const revoke: RevokeControllerConfig<R> = {
      Refresh: RefreshM,
    };

    const authWithRefresh: BasicAuthWithRefresh<U, R> = {
      jwks,
      login,
      register,
      authServerUrl: config.authServerUrl,
      authorize,
      refresh,
      revoke,
    };

    return authWithRefresh;
  } else if (VerifyM && RefreshM && emailClient) {
    const register: RegistrationWithVerificationConftrollerConfig<U, V> = {
      User,
      Verify: VerifyM,
      verifyEmail: emailClient,
    };

    const verify: VerifyControllerConfig<U, V> = {
      User,
      Verify: VerifyM,
    };

    const authorize: AuthorizeControllerConfig<U, R> = {
      User,
      Refresh: RefreshM,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };

    const refresh: RefreshControllerConfig<R> = {
      Refresh: RefreshM,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };

    const revoke: RevokeControllerConfig<R> = {
      Refresh: RefreshM,
    };

    const basic: AuthModuleConfig<U, V, R> = {
      jwks,
      login,
      register,
      authServerUrl: config.authServerUrl,
    };
    return basic;
  }
}

export function createPublicPemFromPrivate(privateKey: string) {
  const publicKey = createPublicKey(privateKey);

  return publicKey.export({ format: 'pem', type: 'spki' }) as string;
}

export function createEmailMessage(authServerUrl: string) {
  return (to: string, token: string) => {
    return {
      to,
      from: 'register@zero-to-production.com',
      subject: 'Verify Your Email',
      text: `Click on the link to verify your email ${authServerUrl}/authorize/verify?token=${token}&email=${to}`,
    };
  };
}

export function isJWKS(
  config: VerifyToken | VerifyTokenJWKS
): config is VerifyToken {
  return (config as VerifyTokenJWKS).authServerUrl === undefined;
}

export function includeRefresh<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(
  config: IncludeRefresh<U, V, R> | ExcludeRefresh<U, V>
): config is IncludeRefresh<U, V, R> {
  return (config as IncludeRefresh<U, V, R>).authorize !== undefined;
}

export function includeEmailVerification<U extends AuthUser, V extends Verify>(
  config:
    | BasicRegistrationControllerConfig<U>
    | RegistrationWithVerificationConftrollerConfig<U, V>
): config is RegistrationWithVerificationConftrollerConfig<U, V> {
  return (
    (config as RegistrationWithVerificationConftrollerConfig<U, V>).Verify !==
    undefined
  );
}
