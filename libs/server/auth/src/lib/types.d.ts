/**
 * Interfaces for each of the model.
 *
 * An interface to define the constructor functions (class's with static methods)
 * and an instance interface.
 *
 * Any model used in this library must satisfy the interfaces
 */

// AuthUser Model
export interface AuthUserModel<U extends AuthUser> {
  new (user: any): U;
  // NOTE -> TypeScript does not currently allow derived classes to override parent static methods
  // and have different call signatures, hence User.findById should no be declared here as the return
  // signature may differ from the base implementation, i.e. Mongoose.
  findByUserId(id: string | undefined): Promise<U | null>;
  findByUsername(username: string): Promise<U | null>;
  findByEmail(email: string): Promise<U | null>;
}

// User
export interface AuthUser {
  id?: string | number;
  username: string;
  email: string;
  active: boolean;
  isVerified: boolean;
  hashedPassword?: string | undefined;
  save(): Promise<this>;
}

// Refresh Token Model
export interface RefreshModel<T extends Refresh> {
  new (token: any): T;
  findByToken(token: string): Promise<T | null>;
}
// Refresh Token
export interface Refresh {
  id: string;
  user: AuthUser;
  token: string;
  save(): Promise<this>;
  remove(): Promise<this>;
}

// Verification Token Model -  Used for email verification
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

// -------------------------------------
// Interfaces for each type of
// auth configuration
// -------------------------------------

export type VerifyEmail = (email: string, token: string) => Promise<any>;
export type PasswordValidator = (password: string) => boolean;

export type AuthModuleConfig<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
> =
  | BasicAuthModule<U>
  | AuthWithValidation<U, V>
  | BasicAuthAndRefresh<U, R>
  | CompleteAuth<U, V, R>;

export interface BasicAuthModule<U extends AuthUser> {
  jwks?: JWKSRoute;
  authServerHost: string;
  login: LoginController<U>;
  register: BasicRegistrationController<U>;
}

export interface AuthWithValidation<U extends AuthUser, V extends Verify>
  extends BasicAuthModule<U> {
  register: RegistrationWithVerificationController<U, V>;
  verify: VerifyController<U, V>;
}

export interface BasicAuthAndRefresh<U extends AuthUser, R extends Refresh>
  extends BasicAuthModule<U> {
  authorize: AuthorizeController<U, R>;
  refresh: RefreshController<R>;
  revoke: RevokeController<R>;
}

export interface CompleteAuth<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
> extends AuthWithValidation<U, V> {
  authorize: AuthorizeController<U, R>;
  refresh: RefreshController<R>;
  revoke: RevokeController<R>;
}

export type WithRefresh<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
> = BasicAuthAndRefresh<U, R> | CompleteAuth<U, V, R>;
export type WithoutRefresh<U extends AuthUser, V extends Verify> =
  | BasicAuthModule<U>
  | AuthWithValidation<U, V>;

// -------------------------------------
// Interfaces for each controller
// -------------------------------------
export interface JWKSRoute {
  publicKey: string;
  keyId: string;
}

export interface LoginController<U extends AuthUser> extends SignAccessToken {
  User: AuthUserModel<U>;
}

export interface BasicRegistrationController<U extends AuthUser> {
  User: AuthUserModel<U>;
  validatePassword?: PasswordValidator;
}

export interface RegistrationWithVerificationController<
  U extends AuthUser,
  V extends Verify
> extends BasicRegistrationController<U> {
  Verify: VerifyModel<V>;
  verifyEmail: VerifyEmail;
}

export type RegistrationConfig<U extends AuthUser, V extends Verify> =
  | BasicRegistrationController<U>
  | RegistrationWithVerificationController<U, V>;

export interface VerifyController<U extends AuthUser, V extends Verify> {
  User: AuthUserModel<U>;
  Verify: VerifyModel<V>;
}

export interface AuthorizeController<U extends AuthUser, R extends Refresh>
  extends LoginController<U>,
    SignRefresh {
  Refresh: RefreshModel<R>;
}

export interface RefreshController<R extends Refresh>
  extends SignAccessToken,
    SignRefresh {
  Refresh: RefreshModel<R>;
}

export interface RevokeController<R extends Refresh> {
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

export interface VerifyJWKS {
  issuer: string;
  audience: string;
  authServerHost: string;
  allowHttp?: boolean;
}

export interface SignRefresh {
  audience: string;
  issuer: string;
  privateKey: string;
}

export interface VerifyRefresh {
  audience: string;
  issuer: string;
  publicKey: string;
}

export interface ActiveUserGuard<U extends AuthUser> {
  User: AuthUserModel<U>;
}

export interface AuthGuard<U extends AuthUser> {
  authenticate: VerifyToken | VerifyJWKS;
  activeUser: ActiveUserGuard<U>;
}

// -------------------------------------
// Interfaces for the auth environment variables
// -------------------------------------

export interface AuthEnv {
  authServerHost: string;
  jwksRoute?: boolean;
  accessToken: {
    privateKey: string;
    publicKey?: string;
    expireTime: number;
    issuer: string;
    audience: string;
  };
  refreshToken?: {
    privateKey: string;
    publicKey?: string;
    issuer: string;
    audience: string;
  };
}

export interface AuthGuardConfig {
  authServerHost: string;
  accessToken: {
    publicKey?: string;
    issuer: string;
    audience: string;
  };
}
