export type VerifyEmail = (to: string, token: string) => Promise<any>;
export type PasswordValidator = (password: string) => boolean;

export type AuthModuleConfig<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
> =
  | BasicAuthModule<U>
  | AuthWithValidation<U, V>
  | BasicAuthWithRefresh<U, R>
  | AuthWithRefresh<U, V, R>;

export interface BasicAuthModule<U extends AuthUser> {
  jwks?: JWKSRouteConfig;
  authServerUrl: string;
  login: LoginControllerConfig<U>;
  register: BasicRegistrationControllerConfig<U>;
}

export interface AuthWithValidation<U extends AuthUser, V extends Verify>
  extends BasicAuthModule<U> {
  register: RegistrationWithVerificationConftrollerConfig<U, V>;
  verify: VerifyControllerConfig<U, V>;
}

export interface BasicAuthWithRefresh<U extends AuthUser, R extends Refresh>
  extends BasicAuthModule<U> {
  authorize: AuthorizeControllerConfig<U, R>;
  refresh: RefreshControllerConfig<R>;
  revoke: RevokeControllerConfig<R>;
}

export interface AuthWithRefresh<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
> extends AuthWithValidation<U, V> {
  authorize: AuthorizeControllerConfig<U, R>;
  refresh: RefreshControllerConfig<R>;
  revoke: RevokeControllerConfig<R>;
}

export type IncludeRefresh<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
> = BasicAuthWithRefresh<U, R> | AuthWithRefresh<U, V, R>;
export type ExcludeRefresh<U extends AuthUser, V extends Verify> =
  | BasicAuthModule<U>
  | AuthWithValidation<U, V>;

// // -------------------------------------
// // For signing and validation access and refresh tokens
// // -------------------------------------

export interface JWKSRouteConfig {
  publicKey: string;
  keyId: string;
}

// -------------------------------------
// Interfaces for each controller
// -------------------------------------
export interface LoginControllerConfig<U extends AuthUser>
  extends SignAccessToken {
  User: UserModel<U>;
}

export interface BasicRegistrationControllerConfig<U extends AuthUser> {
  User: UserModel<U>;
  validatePassword?: PasswordValidator;
}

export interface RegistrationWithVerificationConftrollerConfig<
  U extends AuthUser,
  V extends Verify
> extends BasicRegistrationControllerConfig<U> {
  Verify: VerifyModel<V>;
  verifyEmail: VerifyEmail;
}

export type RegistrationConfig<U extends AuthUser, V extends Verify> =
  | BasicRegistrationControllerConfig<U>
  | RegistrationWithVerificationConftrollerConfig<U, V>;

export interface VerifyControllerConfig<U extends AuthUser, V extends Verify> {
  User: UserModel<U>;
  Verify: VerifyModel<V>;
}

export interface AuthorizeControllerConfig<
  U extends AuthUser,
  R extends Refresh
> extends LoginControllerConfig<U>, SignRefreshToken {
  Refresh: RefreshModel<R>;
}

export interface RefreshControllerConfig<R extends Refresh>
  extends SignAccessToken,
    SignRefreshToken {
  Refresh: RefreshModel<R>;
}

export interface RevokeControllerConfig<R extends Refresh> {
  Refresh: RefreshModel<R>;
}

// -------------------------------------
// Interfaces for the Signing tokens & Auth Guards
// -------------------------------------
export interface SignAccessToken {
  privateKey: string;
  expireTime: number;
  issuer: string;
  audience: string;
  keyId: string;
}

export interface VerifyToken {
  issuer: string;
  audience: string;
  publicKey: string;
}

export interface VerifyTokenJWKS {
  issuer: string;
  audience: string;
  authServerUrl: string;
  allowHttp?: boolean;
}

export interface SignRefreshToken {
  audience: string;
  issuer: string;
  privateKey: string;
}

export interface VerifyRefreshToken {
  audience: string;
  issuer: string;
  publicKey: string;
}

export interface ActiveUserGuard<U extends AuthUser> {
  User: UserModel<U>;
}

export interface AuthGuard<U extends AuthUser> {
  authenticate: VerifyToken | VerifyTokenJWKS;
  activeUser: ActiveUserGuard<U>;
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

export interface UserModel<U extends AuthUser> {
  new (user: any): U;
  // NOTE -> TypeScript does not currently allow derived classes to override parent static methods
  // and have different call signatures, hence User.findById should no be declared here as the return
  // signature may differ from the base implementation, i.e. Mongoose.
  findByUserId(id: string | undefined): Promise<U | null>;
  findByUsername(username: string): Promise<U | null>;
  findByEmail(email: string): Promise<U | null>;
}

export interface AuthUser {
  id: string | number;
  username: string;
  email: string;
  active: boolean;
  isVerified: boolean;
  hashedPassword?: string | undefined;
  save(): Promise<this>;
}

export interface RefreshModel<T extends Refresh> {
  new (token: any): T;
  findByToken(token: string): Promise<T | null>;
}

export interface Refresh {
  id: string;
  user: AuthUser;
  token: string;
  save(): Promise<this>;
  remove(): Promise<this>;
}

export interface VerifyModel<V extends Verify> {
  new (token: any): V;
  findByToken(token: string): Promise<V | null>;
}

// Verification Token
export interface Verify {
  userId: AuthUser | string;
  token: string;
  save(): Promise<this>;
}
