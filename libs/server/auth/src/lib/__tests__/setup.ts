import { IUserModel } from '@ztp/server/core-data';
import { MockUserModel } from './user.mock';
import {
  IVerificationTokenModel,
  IRefreshTokenModel,
  LoginControllerConfig,
  RegistrationWithVerificationConftrollerConfig,
  VerifyControllerConfig,
  AuthorizeControllerConfig,
  RefreshControllerConfig,
  RevokeControllerConfig,
} from '../auth.interface';
import { MockVerificationToken } from './verification.mock';
import { privateKey } from './rsa-keys';
import { MockRefreshTokenModel } from './refresh-token.mock';

export const issuer = 'some-issuer';
export const audience = 'say-hello!!!';
export const keyId = 'key-id';

export function mockRegistrationConfig(
  email: jest.Mock<any, any> = jest.fn()
): RegistrationWithVerificationConftrollerConfig {
  return {
    User: (MockUserModel as unknown) as IUserModel,
    VerificationToken: (MockVerificationToken as unknown) as IVerificationTokenModel,
    verifyEmail: email,
  };
}

export function mockVerificationConfig(): VerifyControllerConfig {
  return {
    User: (MockUserModel as unknown) as IUserModel,
    VerificationToken: (MockVerificationToken as unknown) as IVerificationTokenModel,
  };
}

export function mockLoginConfig(): LoginControllerConfig {
  return {
    User: (MockUserModel as unknown) as IUserModel,
    privateKey,
    expireTime: 100000,
    issuer,
    audience,
    keyId,
  };
}

export function mockAuthorizeConfig(): AuthorizeControllerConfig {
  return {
    User: (MockUserModel as unknown) as IUserModel,
    privateKey,
    expireTime: 100000,
    issuer,
    audience,
    keyId,
    RefreshToken: (MockRefreshTokenModel as unknown) as IRefreshTokenModel,
  };
}

export function mockRefreshTokenConfig(): RefreshControllerConfig {
  return {
    privateKey,
    audience,
    keyId,
    expireTime: 100000,
    issuer,
    RefreshToken: (MockRefreshTokenModel as unknown) as IRefreshTokenModel,
  };
}

export function mockRevokeConfig(): RevokeControllerConfig {
  return {
    RefreshToken: (MockRefreshTokenModel as unknown) as IRefreshTokenModel,
  };
}
