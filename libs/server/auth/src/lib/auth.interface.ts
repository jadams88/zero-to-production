import { GraphQLFieldResolver } from 'graphql';

export type TResolver = GraphQLFieldResolver<any, any, any>;
export type TResolverFactory = (next: TResolver) => TResolver;
export type VerifyEmail = (to: string, token: string) => Promise<any>;

export type AuthModuleConfig<
  U extends User,
  V extends VerificationToken,
  R extends RefreshToken
> =
  | BasicAuthModule<U>
  | AuthWithValidation<U, V>
  | BasicAuthWithRefresh<U, R>
  | AuthWithRefresh<U, V, R>;

export interface BasicAuthModule<U extends User> {
  jwks?: JWKSRouteConfig;
  authServerUrl: string;
  login: LoginControllerConfig<U>;
  register: BasicRegistrationControllerConfig<U>;
}

export interface AuthWithValidation<
  U extends User,
  V extends VerificationToken
> extends BasicAuthModule<U> {
  register: RegistrationWithVerificationConftrollerConfig<U, V>;
  verify: VerifyControllerConfig<U, V>;
}

export interface BasicAuthWithRefresh<U extends User, R extends RefreshToken>
  extends BasicAuthModule<U> {
  authorize: AuthorizeControllerConfig<U, R>;
  refresh: RefreshControllerConfig<R>;
  revoke: RevokeControllerConfig<R>;
}

export interface AuthWithRefresh<
  U extends User,
  V extends VerificationToken,
  R extends RefreshToken
> extends AuthWithValidation<U, V> {
  authorize: AuthorizeControllerConfig<U, R>;
  refresh: RefreshControllerConfig<R>;
  revoke: RevokeControllerConfig<R>;
}

export type IncludeRefresh<
  U extends User,
  V extends VerificationToken,
  R extends RefreshToken
> = BasicAuthWithRefresh<U, R> | AuthWithRefresh<U, V, R>;
export type ExcludeRefresh<U extends User, V extends VerificationToken> =
  | BasicAuthModule<U>
  | AuthWithValidation<U, V>;

// -------------------------------------
// For signing and validation access and refresh tokens
// -------------------------------------

export interface AccessTokenConfig {
  privateKey: string;
  expireTime: number;
  issuer: string;
  audience: string;
  keyId: string;
}

export interface RefreshTokenConfig {
  privateKey: string;
  audience: string;
  issuer: string;
}

export interface JWKSRouteConfig {
  publicKey: string;
  keyId: string;
}

export interface JWKSGuardConfig {
  authServerUrl: string;
  production: boolean;
}

// -------------------------------------
// Interfaces for each controller
// -------------------------------------
export interface LoginControllerConfig<U extends User>
  extends AccessTokenConfig {
  User: UserModel<U>;
}

export interface BasicRegistrationControllerConfig<U extends User> {
  User: UserModel<U>;
}

export interface RegistrationWithVerificationConftrollerConfig<
  U extends User,
  V extends VerificationToken
> extends BasicRegistrationControllerConfig<U> {
  VerificationToken: VerificationTokenModel<V>;
  verifyEmail: VerifyEmail;
}

export type RegistrationConfig<U extends User, V extends VerificationToken> =
  | BasicRegistrationControllerConfig<U>
  | RegistrationWithVerificationConftrollerConfig<U, V>;

export interface VerifyControllerConfig<
  U extends User,
  V extends VerificationToken
> {
  User: UserModel<U>;
  VerificationToken: VerificationTokenModel<V>;
}

export interface AuthorizeControllerConfig<
  U extends User,
  R extends RefreshToken
> extends LoginControllerConfig<U>, RefreshTokenConfig {
  RefreshToken: RefreshTokenModel<R>;
}

export interface RefreshControllerConfig<R extends RefreshToken>
  extends AccessTokenConfig,
    RefreshTokenConfig {
  RefreshToken: RefreshTokenModel<R>;
}

export interface RevokeControllerConfig<R extends RefreshToken> {
  RefreshToken: RefreshTokenModel<R>;
}

// -------------------------------------
// Interfaces for the Auth Guards
// -------------------------------------

export interface GuardConfig<U extends User>
  extends VerifyTokenConfig,
    VerifyUserConfig<U> {}

export interface JWKSGuarConfig<U extends User>
  extends VerifyTokenJWKSConfig,
    VerifyUserConfig<U> {}

export interface VerifyTokenJWKSConfig extends VerifyTokenBaseConfig {
  authServerUrl: string;
  production: boolean;
}

export interface VerifyTokenConfig extends VerifyTokenBaseConfig {
  publicKey: string;
}

export interface VerifyTokenBaseConfig {
  issuer: string;
  audience: string;
}

export interface VerifyUserConfig<U extends User> {
  User: UserModel<U>;
}

// -------------------------------------
// Interfaces for the auth environment config
// -------------------------------------
export interface ServerAuthConfig {
  authServerUrl: string;
  jwksRoute?: boolean;
  accessToken: {
    privateKey: string;
    publicKey?: string;
    expireTime: number;
    issuer: string;
    audience: string;
  };
  refreshToken: {
    privateKey: string;
    publicKey?: string;
    issuer: string;
    audience: string;
  };
}

export interface UserModel<U extends User> {
  new (user: any): U;
  // NOTE -> TypeScript does not currently allow derived classes to override parent static methods
  // and have different call signatures, hence User.findById should no be declared here as the return
  // signature may differ from the base implementation, i.e. Mongoose.
  findByUserId(id: string | undefined): Promise<U | null>;
  findByUsername(username: string): Promise<U | null>;
  findByEmail(email: string): Promise<U | null>;
}

export interface User {
  id: string | number;
  username: string;
  email: string;
  active: boolean;
  isVerified: boolean;
  hashedPassword?: string | undefined;
  save(): Promise<this>;
}

export interface RefreshTokenModel<T extends RefreshToken> {
  new (token: any): T;
  findByToken(token: string): Promise<T | null>;
}

export interface RefreshToken {
  id: string;
  user: User;
  token: string;
  save(): Promise<this>;
  remove(): Promise<this>;
}

export interface VerificationTokenModel<V extends VerificationToken> {
  new (token: any): V;
  findByToken(token: string): Promise<V | null>;
}

export interface VerificationToken {
  userId: User | string;
  token: string;
  save(): Promise<this>;
}
