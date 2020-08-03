import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import 'jest-extended';
import {
  setupRegisterController,
  setupVerifyController,
  setupLoginController,
  setupAuthorizeController,
  setupRefreshAccessTokenController,
  setupRevokeRefreshTokenController,
} from './controllers';
import { signRefreshToken } from './tokens';
import {
  mockRegistrationConfig,
  audience,
  issuer,
  mockVerificationConfig,
  mockLoginConfig,
  mockAuthorizeConfig,
  mockRefreshTokenConfig,
  mockRevokeConfig,
  MockAuthUserModel,
  MockVerifyModel,
  privateKey,
  MockRefreshModel,
} from '../__tests__/index';
import { VerifyModel, AuthUser, AuthUserModel, Verify } from '../types';

export function newId() {
  return mongoose.Types.ObjectId().toHexString();
}

export function mockRegistrationController(
  email: jest.Mock<any, any> = jest.fn()
) {
  return setupRegisterController(mockRegistrationConfig(email));
}

export function mockVerificationController() {
  return setupVerifyController(mockVerificationConfig());
}

export function mockLoginController() {
  return setupLoginController(mockLoginConfig());
}

export function mockAuthorizeController() {
  return setupAuthorizeController(mockAuthorizeConfig());
}

export function mockRefreshTokenController() {
  return setupRefreshAccessTokenController(mockRefreshTokenConfig());
}

export function mockRevokeController() {
  return setupRevokeRefreshTokenController(mockRevokeConfig());
}

export function mockUserAvailableController() {
  return setupUserAvailableController(mockLoginConfig());
}

const userToRegister = ({
  username: 'uniqueUsername',
  firstName: 'test',
  lastName: 'user',
  email: 'unique@email.com',
  dateOfBirth: new Date(),
  active: true,
  isVerified: false,
} as any) as AuthUser;

const userWithPassword = ({
  ...userToRegister,
  password: 'adf#jf3@#FD!',
} as any) as AuthUser;

describe('Auth - Controllers', () => {
  describe('register', () => {
    it('should register a new user', async () => {
      MockAuthUserModel.userToRespondWith = null;

      const createdUser = await setupRegisterController({
        User: (MockAuthUserModel as unknown) as AuthUserModel<AuthUser>,
        Verify: (MockVerifyModel as unknown) as VerifyModel<Verify>,
        verifyEmail: jest.fn(),
      })({ ...userWithPassword });

      expect(createdUser).toBeTruthy();
      expect(createdUser.id).toBeDefined();

      MockAuthUserModel.reset();
      MockVerifyModel.reset();
    });

    it('should send a verification email to the users email', async () => {
      MockAuthUserModel.userToRespondWith = null;

      const spy = jest.fn();

      const createdUser = await mockRegistrationController(spy)({
        ...userWithPassword,
      });

      expect(spy).toHaveBeenCalled();
      const [to, verificationToken] = spy.mock.calls[0];
      expect(to).toBe(createdUser.email);
      expect(verificationToken).toBeString();

      MockAuthUserModel.reset();
      MockVerifyModel.reset();
    });

    it('should not return the password or hashed password if successful', async () => {
      MockAuthUserModel.userToRespondWith = null;

      const createdUser = await mockRegistrationController()({
        ...userWithPassword,
      });

      expect((createdUser as any).password).not.toBeDefined();
      expect(createdUser.hashedPassword).not.toBeDefined();

      MockAuthUserModel.reset();
      MockVerifyModel.reset();
    });

    it('should not not allow a user to register if the username is taken', async () => {
      const userWithUniqueDetails = {
        ...userWithPassword,
        username: 'anotherUsername',
        emailAddress: 'anotherUnique@email.com',
      } as AuthUser;

      MockAuthUserModel.userToRespondWith = null;

      await expect(
        mockRegistrationController()(userWithUniqueDetails)
      ).resolves.not.toThrowError();

      MockAuthUserModel.userToRespondWith = userWithUniqueDetails;

      await expect(
        mockRegistrationController()(userWithUniqueDetails)
      ).rejects.toThrowError('Username is not available');

      MockAuthUserModel.reset();
      MockVerifyModel.reset();
    });
  });

  describe('verify', () => {
    it('should verify a users email', async () => {
      const userId = '1';
      const token = 'SOME-TOKEN';

      const unverifiedUser = {
        id: userId,
        ...userToRegister,
      };

      const verificationToken = {
        token,
        userId,
      };

      MockAuthUserModel.userToRespondWith = unverifiedUser;
      MockVerifyModel.tokenToRespondWith = verificationToken;

      expect(MockAuthUserModel.currentSetModel?.isVerified).toBe(false);
      expect(MockVerifyModel.currentSetModel).toBeDefined();

      const { message } = await mockVerificationController()(
        userToRegister.email,
        token
      );

      expect(MockAuthUserModel.currentSetModel?.isVerified).toBe(true);
      expect(MockVerifyModel.currentSetModel).toBe(null);

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });

    it('should throw if a user cannot be found', async () => {
      const token = 'SOME-TOKEN';
      MockAuthUserModel.userToRespondWith = null;

      await expect(
        mockVerificationController()(userToRegister.email, token)
      ).rejects.toThrowError('Email address is not available');

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });

    it('should throw if the user is already valid', async () => {
      const token = 'SOME-TOKEN';

      MockAuthUserModel.userToRespondWith = {
        ...userToRegister,
        isVerified: true,
      };

      await expect(
        mockVerificationController()(userToRegister.email, token)
      ).rejects.toThrowError('User is already registered');

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });

    it('should throw if the token is not valid', async () => {
      const token = 'SOME-TOKEN';

      MockAuthUserModel.userToRespondWith = { ...userToRegister };
      MockVerifyModel.tokenToRespondWith = null;

      await expect(
        mockVerificationController()(userToRegister.email, token)
      ).rejects.toThrowError('Token is not valid');

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });

    it('should throw if the token does not belong to the user', async () => {
      const token = 'SOME-TOKEN';

      MockAuthUserModel.userToRespondWith = {
        id: '1',
        ...userToRegister,
      };
      MockVerifyModel.tokenToRespondWith = {
        token,
        userId: '2',
      };

      await expect(
        mockVerificationController()(userToRegister.email, token)
      ).rejects.toThrowError('Token does not match email address');

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });
  });

  describe('login', () => {
    it('should return an access token if correct credentials are provided', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((userWithId as any).password, 10);

      MockAuthUserModel.userToRespondWith = userWithId;

      const { token } = await mockLoginController()(
        userWithId.username,
        (userWithId as any).password
      );

      expect(token).toBeDefined();
      expect(token).toBeString();

      MockAuthUserModel.reset();
    });

    it('should throw unauthorized error if the User is not found', async () => {
      MockAuthUserModel.userToRespondWith = null;

      await expect(
        mockLoginController()(
          userWithPassword.username,
          (userWithPassword as any).password
        )
      ).rejects.toThrowError('Unauthorized');

      MockAuthUserModel.reset();
    });

    it('should throw unauthorized error if the credentials are incorrect', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((userWithId as any).password, 10);

      MockAuthUserModel.userToRespondWith = userWithId;

      await expect(
        mockLoginController()(userWithId.username, 'somWrongPassword')
      ).rejects.toThrowError('Unauthorized');

      await expect(
        mockLoginController()('someWrongUsername', (userWithId as any).password)
      ).rejects.toThrowError('Unauthorized');
    });

    it('should throw an unauthorized error if the user is not active', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((userWithId as any).password, 10);

      const inactiveUser = {
        ...userWithId,
        active: false,
      };
      MockAuthUserModel.userToRespondWith = inactiveUser;

      await expect(
        mockLoginController()(userWithId.username, (userWithId as any).password)
      ).rejects.toThrowError('Unauthorized');
    });
  });

  describe('authorize', () => {
    it('should return an accessToken and refreshToken if the credentials correct', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((userWithId as any).password, 10);

      MockAuthUserModel.userToRespondWith = userWithId;

      const { token, refreshToken } = await mockAuthorizeController()(
        userWithId.username,
        (userWithId as any).password
      );

      expect(token).toBeDefined();
      expect(token).toBeString();
      expect(refreshToken).toBeDefined();
      expect(refreshToken).toBeString();

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should throw unauthorized error if the credentials are incorrect', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((userWithId as any).password, 10);

      MockAuthUserModel.userToRespondWith = userWithId;

      await expect(
        mockAuthorizeController()(userWithId.username, 'somWrongPassword')
      ).rejects.toThrowError('Unauthorized');

      await expect(
        mockAuthorizeController()(
          'someWrongUsername',
          (userWithId as any).password
        )
      ).rejects.toThrowError('Unauthorized');
    });

    it('should throw an unauthorized error if the user is not active', async () => {
      const inactiveUser = {
        ...userWithPassword,
        id: newId(),
        active: false,
      };

      // Set the hashed password to be correct
      inactiveUser.hashedPassword = await hash(
        (inactiveUser as any).password,
        10
      );

      MockAuthUserModel.userToRespondWith = inactiveUser;

      await expect(
        mockAuthorizeController()(
          inactiveUser.username,
          (inactiveUser as any).password
        )
      ).rejects.toThrowError('Unauthorized');

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });
  });

  describe('refreshAccessToken', () => {
    it('should return a new access token when the a valid refresh token is provided', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      const refreshTokenString = signRefreshToken({
        privateKey,
        audience,
        issuer,
      })(userWithId);

      const refreshToken = {
        user: {
          id: userWithId.id,
          username: userWithId.username,
          active: true,
        } as AuthUser,
        token: refreshTokenString,
      };

      MockRefreshModel.tokenToRespondWith = refreshToken;

      const { token } = await mockRefreshTokenController()(
        userWithId.username,
        refreshToken.token
      );

      expect(token).toBeDefined();
      expect(token).toBeString();

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should throw a unauthorized error if invalid token provided', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      const refreshTokenString = signRefreshToken({
        privateKey,
        audience,
        issuer,
      })(userWithId);

      const refreshToken = {
        user: {
          id: userWithId.id,
          username: userWithId.username,
          active: true,
        } as AuthUser,
        token: refreshTokenString,
      };

      MockRefreshModel.tokenToRespondWith = refreshToken;

      await expect(
        mockRefreshTokenController()(userWithId.username, 'incorrect token')
      ).rejects.toThrowError('Unauthorized');

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should throw a unauthorized errors if invalid username provided', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      const refreshTokenString = signRefreshToken({
        privateKey,
        audience,
        issuer,
      })(userWithId);

      const refreshToken = {
        user: {
          id: userWithId.id,
          username: userWithId.username,
          active: true,
        } as AuthUser,
        token: refreshTokenString,
      };

      MockRefreshModel.tokenToRespondWith = refreshToken;

      await expect(
        mockRefreshTokenController()('incorrect username', refreshToken.token)
      ).rejects.toThrowError('Unauthorized');

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should throw a unauthorized errors if the user is not active', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
        active: false,
      };

      const refreshTokenString = signRefreshToken({
        privateKey,
        audience,
        issuer,
      })(userWithId);

      const refreshToken = {
        user: {
          id: userWithId.id,
          username: userWithId.username,
          active: false,
        } as AuthUser,
        token: refreshTokenString,
      };

      MockRefreshModel.tokenToRespondWith = refreshToken;

      await expect(
        mockRefreshTokenController()(userWithId.username, refreshToken.token)
      ).rejects.toThrowError('Unauthorized');

      // check the 'remove' handler has been called
      expect(MockRefreshModel.currentSetModel).toBe(null);

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke the refresh token provided', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      const refreshTokenString = signRefreshToken({
        privateKey,
        audience,
        issuer,
      })(userWithId);

      const refreshToken = {
        user: {
          id: userWithId.id,
          username: userWithId.username,
        } as AuthUser,
        token: refreshTokenString,
      };

      MockRefreshModel.tokenToRespondWith = refreshToken;

      const { success } = await mockRevokeController()(refreshToken.token);

      expect(success).toBe(true);
      // check if remove was called
      expect(MockRefreshModel.currentSetModel).toBe(null);

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });
  });

  describe('userAvailable', () => {
    it('isAvailable should be true if a user with that username can not be found', async () => {
      MockAuthUserModel.userToRespondWith = null;

      const { isAvailable } = await mockUserAvailableController()(
        'mockUsername'
      );

      expect(isAvailable).toBe(true);

      MockAuthUserModel.reset();
    });

    it('isAvailable should be false if a user with that username is found', async () => {
      const takenUsername = 'takenUsername';
      const user = {
        username: takenUsername,
      } as AuthUser;

      MockAuthUserModel.userToRespondWith = user;

      const { isAvailable } = await mockUserAvailableController()(
        takenUsername
      );

      expect(isAvailable).toBe(false);

      MockAuthUserModel.reset();
    });
  });
});
