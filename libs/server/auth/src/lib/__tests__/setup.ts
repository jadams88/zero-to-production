import { MockAuthUserModel } from './user.mock';
import { MockVerifyModel } from './verification.mock';
import { privateKey } from './rsa-keys';
import { MockRefreshModel } from './refresh-token.mock';
import {
  Verify,
  VerifyModel,
  Refresh,
  RefreshModel,
  VerifyController,
  AuthorizeController,
  RefreshController,
  RevokeController,
  AuthUser,
  AuthUserModel,
  RegisterController,
} from '../types';

export const issuer = 'some-issuer';
export const audience = 'say-hello!!!';
export const keyId = 'key-id';

export function mockRegistrationConfig(
  email: jest.Mock<any, any> = jest.fn()
): RegisterController<AuthUser, Verify> {
  return {
    User: (MockAuthUserModel as unknown) as AuthUserModel<AuthUser>,
    Verify: (MockVerifyModel as unknown) as VerifyModel<Verify>,
    verifyEmail: email,
  };
}

export function mockVerificationConfig(): VerifyController<AuthUser, Verify> {
  return {
    User: (MockAuthUserModel as unknown) as AuthUserModel<AuthUser>,
    Verify: (MockVerifyModel as unknown) as VerifyModel<Verify>,
  };
}

export function mockAuthorizeConfig(): AuthorizeController<AuthUser, Refresh> {
  return {
    User: (MockAuthUserModel as unknown) as AuthUserModel<AuthUser>,
    privateKey,
    expireTime: 100000,
    issuer,
    audience,
    keyId,
    Refresh: (MockRefreshModel as unknown) as RefreshModel<Refresh>,
  };
}

export function mockRefreshTokenConfig(): RefreshController<Refresh> {
  return {
    privateKey,
    audience,
    keyId,
    expireTime: 100000,
    issuer,
    Refresh: (MockRefreshModel as unknown) as RefreshModel<Refresh>,
  };
}

export function mockRevokeConfig(): RevokeController<Refresh> {
  return {
    Refresh: (MockRefreshModel as unknown) as RefreshModel<Refresh>,
  };
}
