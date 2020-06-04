import { createPublicKey, createHash } from 'crypto';
// @ts-ignore
import omit from 'lodash.omit';
import {
  JWKSGuarConfig,
  GuardConfig,
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
  User,
  VerificationToken,
  RefreshToken,
  BasicAuthModule,
  VerificationTokenModel,
  RefreshTokenModel,
  AuthWithValidation,
  BasicAuthWithRefresh,
  AuthWithRefresh,
  LoginControllerConfig,
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

export function generateAuthGuardConfig<U extends User>(
  production: boolean,
  authConfig: ServerAuthConfig,
  User: UserModel<U>
): GuardConfig<U> | JWKSGuarConfig<U> {
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
      production,
      authServerUrl: authConfig.authServerUrl,
      issuer: authConfig.accessToken.issuer,
      audience: authConfig.accessToken.audience,
    };
  }
}

// A no-op placeholder function for if no email verification is provided
// export const noOpEmailVerification: VerifyEmail = async (to, token) =>
//   Promise.resolve(true);

// export function generateAuthModuleConfig(
//   User: IUserModel,
//   config: ServerAuthConfig,
//   VerificationToken?: IVerificationTokenModel,
//   RefreshToken?: IRefreshTokenModel,
//   email?: VerifyEmail
// ): AuthModuleConfig {
//   const { publicKey, privateKey } = config.accessToken;
//   const pubKey = publicKey ? publicKey : createPublicPemFromPrivate(privateKey);

//   // The KeyId is used to retrieve the appropriate public key from a JWKS.
//   // There structure of the key is unspecified (https://tools.ietf.org/html/rfc7517#section-4.5)
//   // It is common practice to generate a UUID or similar as the key, however this
//   // will not work in a scenario such as a cloud functions (lambda) or in K8s
//   // where they can be any number of containers. So create a hash from public
//   // key as the keyId
//   const keyId = createHash('md5').update(pubKey).digest('hex');

//   return {
//     jwks: config.jwksRoute
//       ? {
//           publicKey: pubKey,
//           keyId,
//         }
//       : undefined,
//     login: { User, ...config.accessToken, keyId },
//     register: { User, VerificationToken, ...config.accessToken },
//     verify: { User, VerificationToken, ...config.accessToken },
//     authorize: {
//       User,
//       RefreshToken,
//       ...config.accessToken,
//       ...config.refreshToken,
//       keyId,
//     },
//     refresh: {
//       RefreshToken,
//       ...config.accessToken,
//       ...config.refreshToken,
//       keyId,
//     },
//     revoke: { RefreshToken },
//     email: email ? email : noOpEmailVerification,
//     authServerUrl: config.authServerUrl,
//   };
// }

export function generateAuthModuleConfig<U extends User>(
  User: UserModel<U>,
  config: ServerAuthConfig
): BasicAuthModule<U>;
export function generateAuthModuleConfig<
  U extends User,
  V extends VerificationToken
>(
  User: UserModel<U>,
  config: ServerAuthConfig,
  VerificationToken: VerificationTokenModel<V>,
  emailClient: VerifyEmail
): AuthWithValidation<U, V>;
export function generateAuthModuleConfig<
  U extends User,
  R extends RefreshToken
>(
  User: UserModel<U>,
  config: ServerAuthConfig,
  RefreshToken: RefreshTokenModel<R>
): BasicAuthWithRefresh<U, R>;
export function generateAuthModuleConfig<
  U extends User,
  V extends VerificationToken,
  R extends RefreshToken
>(
  User: UserModel<U>,
  config: ServerAuthConfig,
  VerificationToken: VerificationTokenModel<V>,
  emailClient: VerifyEmail,
  RefreshToken: RefreshTokenModel<R>
): AuthWithRefresh<U, V, R>;
export function generateAuthModuleConfig<
  U extends User,
  V extends VerificationToken,
  R extends RefreshToken
>(
  User: UserModel<U>,
  config: ServerAuthConfig,
  VerificationToken?: VerificationTokenModel<V>,
  emailClient?: VerifyEmail,
  RefreshToken?: RefreshTokenModel<R>
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

  const login: LoginControllerConfig<U> = {
    User,
    ...config.accessToken,
    keyId,
  };

  if (
    VerificationToken === undefined &&
    emailClient === undefined &&
    RefreshToken === undefined
  ) {
    const register: BasicRegistrationControllerConfig<U> = {
      User,
    };

    const basic: BasicAuthModule<U> = {
      jwks,
      login,
      register,
      authServerUrl: config.authServerUrl,
    };

    return basic;
  } else if (VerificationToken && emailClient && RefreshToken === undefined) {
    const register: RegistrationWithVerificationConftrollerConfig<U, V> = {
      User,
      VerificationToken,
      verifyEmail: emailClient,
    };

    const verify: VerifyControllerConfig<U, V> = {
      User,
      VerificationToken,
    };

    const authWithValidation: AuthWithValidation<U, V> = {
      jwks,
      login,
      register,
      authServerUrl: config.authServerUrl,
      verify,
    };

    return authWithValidation;
  } else if (
    VerificationToken === undefined &&
    emailClient === undefined &&
    RefreshToken
  ) {
    const register: BasicRegistrationControllerConfig<U> = {
      User,
    };

    const authorize: AuthorizeControllerConfig<U, R> = {
      User,
      RefreshToken,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };
    const refresh: RefreshControllerConfig<R> = {
      RefreshToken,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };

    const revoke: RevokeControllerConfig<R> = {
      RefreshToken,
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
  } else if (VerificationToken && RefreshToken && emailClient) {
    const register: RegistrationWithVerificationConftrollerConfig<U, V> = {
      User,
      VerificationToken,
      verifyEmail: emailClient,
    };

    const verify: VerifyControllerConfig<U, V> = {
      User,
      VerificationToken,
    };

    const authorize: AuthorizeControllerConfig<U, R> = {
      User,
      RefreshToken,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };

    const refresh: RefreshControllerConfig<R> = {
      RefreshToken,
      ...config.accessToken,
      ...config.refreshToken,
      keyId,
    };

    const revoke: RevokeControllerConfig<R> = {
      RefreshToken,
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

export function isJWKS<U extends User>(
  config: JWKSGuarConfig<U> | GuardConfig<U>
): config is JWKSGuarConfig<U> {
  return (config as GuardConfig<U>).publicKey === undefined;
}

export function includeRefresh<
  U extends User,
  V extends VerificationToken,
  R extends RefreshToken
>(
  config: IncludeRefresh<U, V, R> | ExcludeRefresh<U, V>
): config is IncludeRefresh<U, V, R> {
  return (config as IncludeRefresh<U, V, R>).authorize !== undefined;
}

export function includeEmailVerification<
  U extends User,
  V extends VerificationToken
>(
  config:
    | BasicRegistrationControllerConfig<U>
    | RegistrationWithVerificationConftrollerConfig<U, V>
): config is RegistrationWithVerificationConftrollerConfig<U, V> {
  return (
    (config as RegistrationWithVerificationConftrollerConfig<U, V>)
      .VerificationToken !== undefined
  );
}
