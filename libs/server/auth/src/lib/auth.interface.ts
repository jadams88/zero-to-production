import mongoose from 'mongoose';
import { GraphQLFieldResolver } from 'graphql';
import { IUserModel, IUserDocument } from '@ztp/server/core-data';

export type TResolver = GraphQLFieldResolver<any, any, any>;
export type TResolverFactory = (next: TResolver) => TResolver;
export type VerifyEmail = (to: string, token: string) => Promise<any>;

export type AuthModuleConfig =
  | LoginAndRegisterConfig
  | AuthWithRefreshTokenConfig;

export interface LoginAndRegisterConfig {
  jwks?: JWKSRouteConfig;
  login: LoginControllerConfig;
  verify: VerifyControllerConfig;
  register: VerifyControllerConfig; // This is the same as verify because setting up the SendGrid email happens in the controller
  email: VerifyEmail;
}

export interface AuthWithRefreshTokenConfig extends LoginAndRegisterConfig {
  authorize: AuthorizeControllerConfig;
  refresh: RefreshControllerConfig;
  revoke: RevokeControllerConfig;
}

// -------------------------------------
// For signing access and refresh tokens
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

export interface EmailVerificationConfig {
  sendGridApiKey: string;
  authServerUrl: string;
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
export interface LoginControllerConfig extends AccessTokenConfig {
  User: IUserModel;
}

export interface VerifyControllerConfig {
  User: IUserModel;
  VerificationToken: IVerificationTokenModel;
}

export interface RegistrationControllerConfig extends VerifyControllerConfig {
  verifyEmail: VerifyEmail;
}

// export interface AvailableControllerConfig {
//   User: IUserModel;
// }

export interface AuthorizeControllerConfig
  extends LoginControllerConfig,
    RefreshTokenConfig {
  RefreshToken: IRefreshTokenModel;
}

export interface RefreshControllerConfig
  extends AccessTokenConfig,
    RefreshTokenConfig {
  RefreshToken: IRefreshTokenModel;
}

export interface RevokeControllerConfig {
  RefreshToken: IRefreshTokenModel;
}

// -------------------------------------
// Interfaces for the Auth Guards
// -------------------------------------

export interface GuardConfig extends VerifyTokenConfig, VerifyUserConfig {}

export interface JWKSGuarConfig
  extends VerifyTokenJWKSConfig,
    VerifyUserConfig {}

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

export interface VerifyUserConfig {
  User: IUserModel;
}

// -------------------------------------
// Interfaces for each Model
// -------------------------------------
export interface IRefreshToken {
  id: string;
  user: IUserDocument;
  token: string;
}

export interface IRefreshTokenDocument
  extends IRefreshToken,
    mongoose.Document {
  id: string;
}

export interface IRefreshTokenModel
  extends mongoose.Model<IRefreshTokenDocument> {
  findByTokenWithUser(token: string): Promise<IRefreshTokenDocument | null>;
}

export interface IVerificationToken {
  userId: string;
  token: string;
}

export interface IVerificationTokenDocument
  extends IVerificationToken,
    mongoose.Document {
  id: string;
}

export interface IVerificationTokenModel
  extends mongoose.Model<IVerificationTokenDocument> {}

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
  email: {
    authServerUrl: string;
    sendGridApiKey: string;
  };
}
