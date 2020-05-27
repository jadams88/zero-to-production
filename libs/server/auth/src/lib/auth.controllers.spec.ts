import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import 'jest-extended';
import { IUser } from '@ztp/data';
import { IUserModel } from '@ztp/server/core-data';
import {
  setupRegisterController,
  setupVerifyController,
  setupLoginController,
  setupAuthorizeController,
  setupRefreshAccessTokenController,
  setupRevokeRefreshTokenController,
  setupUserAvailableController,
} from './auth.controllers';
import { signRefreshToken } from './sign-tokens';
import { IVerificationTokenModel } from './auth.interface';
import {
  mockRegistrationConfig,
  audience,
  issuer,
  mockVerificationConfig,
  mockLoginConfig,
  mockAuthorizeConfig,
  mockRefreshTokenConfig,
  mockRevokeConfig,
  MockUserModel,
  MockVerificationToken,
  privateKey,
  MockRefreshTokenModel,
} from './__tests__';

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
  emailAddress: 'unique@email.com',
  dateOfBirth: new Date(),
  active: true,
  isVerified: false,
} as any) as IUser;

const userWithPassword = ({
  ...userToRegister,
  password: 'adf#jf3@#FD!',
} as any) as IUser;

describe(`Authentication Controllers`, () => {
  describe('register', () => {
    it('should register a new user', async () => {
      MockUserModel.userToRespondWith = null;

      const createdUser = await setupRegisterController({
        User: (MockUserModel as unknown) as IUserModel,
        VerificationToken: (MockVerificationToken as unknown) as IVerificationTokenModel,
        verifyEmail: jest.fn(),
      })({ ...userWithPassword });

      expect(createdUser).toBeTruthy();
      expect(createdUser.id).toBeDefined();

      MockUserModel.reset();
      MockVerificationToken.reset();
    });

    it('should send a verification email the users email', async () => {
      MockUserModel.userToRespondWith = null;

      const spy = jest.fn();

      const createdUser = await mockRegistrationController(spy)({
        ...userWithPassword,
      });

      expect(spy).toHaveBeenCalled();
      const [to, verificationToken] = spy.mock.calls[0];
      expect(to).toBe(createdUser.email);
      expect(verificationToken).toBeString();

      MockUserModel.reset();
      MockVerificationToken.reset();
    });

    it('should not return the password or hashed password if successful', async () => {
      MockUserModel.userToRespondWith = null;

      const createdUser = await mockRegistrationController()({
        ...userWithPassword,
      });

      expect((createdUser as any).password).not.toBeDefined();
      expect(createdUser.hashedPassword).not.toBeDefined();

      MockUserModel.reset();
      MockVerificationToken.reset();
    });

    it('should not not allow a user to register if the username is taken', async () => {
      const userWithUniqueDetails = {
        ...userWithPassword,
        username: 'anotherUsername',
        emailAddress: 'anotherUnique@email.com',
      } as IUser;

      MockUserModel.userToRespondWith = null;

      await expect(
        mockRegistrationController()(userWithUniqueDetails)
      ).resolves.not.toThrowError();

      MockUserModel.userToRespondWith = userWithUniqueDetails;

      await expect(
        mockRegistrationController()(userWithUniqueDetails)
      ).rejects.toThrowError('Username is not available');

      MockUserModel.reset();
      MockVerificationToken.reset();
    });
  });

  describe('verify', () => {
    it('should verify a users email', async () => {
      const userId = '1';
      const token = 'SOME-TOKEN';

      const setMock = jest.fn();
      const removeMock = jest.fn();
      MockUserModel.userToRespondWith = {
        id: userId,
        ...userToRegister,
        ...{ set: setMock, save: jest.fn() },
      };
      MockVerificationToken.tokenToRespondWith = {
        token,
        userId,
        ...{ remove: removeMock },
      };

      expect((MockUserModel._user as IUser).isVerified).toBe(false);

      const message = await mockVerificationController()(
        userToRegister.email,
        token
      );

      expect(setMock).toHaveBeenCalled();
      expect(setMock.mock.calls[0][0]).toEqual({ isVerified: true });
      expect(removeMock).toHaveBeenCalled();

      MockVerificationToken.reset();
      MockUserModel.reset();
    });

    it('should throw if a user cannot be found', async () => {
      const token = 'SOME-TOKEN';
      MockUserModel.userToRespondWith = null;

      await expect(
        mockVerificationController()(userToRegister.email, token)
      ).rejects.toThrowError('Email address is not available');

      MockVerificationToken.reset();
      MockUserModel.reset();
    });

    it('should throw if the user is already valid', async () => {
      const token = 'SOME-TOKEN';

      MockUserModel.userToRespondWith = {
        ...userToRegister,
        isVerified: true,
      };

      await expect(
        mockVerificationController()(userToRegister.email, token)
      ).rejects.toThrowError('User is already registered');

      MockVerificationToken.reset();
      MockUserModel.reset();
    });

    it('should throw if the token is not valid', async () => {
      const token = 'SOME-TOKEN';

      MockUserModel.userToRespondWith = { ...userToRegister };
      MockVerificationToken.tokenToRespondWith = null;

      await expect(
        mockVerificationController()(userToRegister.email, token)
      ).rejects.toThrowError('Token is not valid');

      MockVerificationToken.reset();
      MockUserModel.reset();
    });

    it('should throw if the token does not belong to the user', async () => {
      const token = 'SOME-TOKEN';

      const setMock = jest.fn();
      const removeMock = jest.fn();
      MockUserModel.userToRespondWith = {
        id: '1',
        ...userToRegister,
      };
      MockVerificationToken.tokenToRespondWith = {
        token,
        userId: '2',
      };

      await expect(
        mockVerificationController()(userToRegister.email, token)
      ).rejects.toThrowError('Token does not match email address');

      MockVerificationToken.reset();
      MockUserModel.reset();
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

      MockUserModel.userToRespondWith = userWithId;

      const { token } = await mockLoginController()(
        userWithId.username,
        (userWithId as any).password
      );

      expect(token).toBeDefined();
      expect(token).toBeString();

      MockUserModel.reset();
    });

    it('should throw unauthorized error if the User is not found', async () => {
      MockUserModel.userToRespondWith = null;

      await expect(
        mockLoginController()(
          userWithPassword.username,
          (userWithPassword as any).password
        )
      ).rejects.toThrowError('Unauthorized');

      MockUserModel.reset();
    });

    it('should throw unauthorized error if the credentials are incorrect', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((userWithId as any).password, 10);

      MockUserModel.userToRespondWith = userWithId;

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
      MockUserModel.userToRespondWith = inactiveUser;

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

      MockUserModel.userToRespondWith = userWithId;

      const { token, refreshToken } = await mockAuthorizeController()(
        userWithId.username,
        (userWithId as any).password
      );

      expect(token).toBeDefined();
      expect(token).toBeString();
      expect(refreshToken).toBeDefined();
      expect(refreshToken).toBeString();

      MockUserModel.reset();
      MockRefreshTokenModel.reset();
    });

    it('should throw unauthorized error if the credentials are incorrect', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((userWithId as any).password, 10);

      MockUserModel.userToRespondWith = userWithId;

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

      MockUserModel.userToRespondWith = inactiveUser;

      await expect(
        mockAuthorizeController()(
          inactiveUser.username,
          (inactiveUser as any).password
        )
      ).rejects.toThrowError('Unauthorized');

      MockUserModel.reset();
      MockRefreshTokenModel.reset();
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

      const refreshToken = await MockRefreshTokenModel.create({
        user: {
          id: userWithId.id,
          username: userWithId.username,
        } as IUser,
        token: refreshTokenString,
      });

      MockRefreshTokenModel.findByTokenWithUserResponse = refreshToken.toJSON();

      const { token } = await mockRefreshTokenController()(
        userWithId.username,
        refreshToken.toJSON().token
      );

      expect(token).toBeDefined();
      expect(token).toBeString();

      MockUserModel.reset();
      MockRefreshTokenModel.reset();
    });

    it('should throw a unauthorized errors if invalid username or token provided', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      const refreshTokenString = signRefreshToken({
        privateKey,
        audience,
        issuer,
      })(userWithId);

      const refreshToken = await MockRefreshTokenModel.create({
        user: {
          id: userWithId.id,
          username: userWithId.username,
        } as IUser,
        token: refreshTokenString,
      });

      MockRefreshTokenModel.findByTokenWithUserResponse = refreshToken.toJSON();

      await expect(
        mockRefreshTokenController()(userWithId.username, 'incorrect token')
      ).rejects.toThrowError('Unauthorized');

      await expect(
        mockRefreshTokenController()(
          'incorrect username',
          refreshToken.toJSON().token
        )
      ).rejects.toThrowError('Unauthorized');

      MockUserModel.reset();
      MockRefreshTokenModel.reset();
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

      const refreshToken = await MockRefreshTokenModel.create({
        user: {
          id: userWithId.id,
          username: userWithId.username,
        } as IUser,
        token: refreshTokenString,
      });

      MockRefreshTokenModel.findByTokenWithUserResponse = refreshToken.toJSON();

      const { success } = await mockRevokeController()(
        refreshToken.toJSON().token
      );

      expect(success).toBe(true);

      MockUserModel.reset();
      MockRefreshTokenModel.reset();
    });

    it('should throw a bad request if the token can not be found', async () => {
      const userWithId = {
        ...userWithPassword,
        id: newId(),
      };

      const refreshTokenString = signRefreshToken({
        privateKey,
        audience,
        issuer,
      })(userWithId);

      const refreshToken = await MockRefreshTokenModel.create({
        user: {
          id: userWithId.id,
          username: userWithId.username,
        } as IUser,
        token: refreshTokenString,
      });

      MockRefreshTokenModel.findByTokenWithUserResponse = refreshToken.toJSON();

      await expect(
        mockRevokeController()('THIS IS NOT A THE CORRECT TOKEN')
      ).rejects.toThrowError('Bad Request');

      MockUserModel.reset();
      MockRefreshTokenModel.reset();
    });
  });

  describe('userAvailable', () => {
    it('isAvailable should be true if a user with that username can not be found', async () => {
      MockUserModel.userToRespondWith = null;

      const { isAvailable } = await mockUserAvailableController()(
        'mockUsername'
      );

      expect(isAvailable).toBe(true);

      MockUserModel.reset();
    });

    it('isAvailable should be false if a user with that username is found', async () => {
      const takenUsername = 'takenUsername';
      const user = {
        username: takenUsername,
      } as IUser;

      MockUserModel.userToRespondWith = user;

      const { isAvailable } = await mockUserAvailableController()(
        takenUsername
      );

      expect(isAvailable).toBe(false);

      MockUserModel.reset();
    });
  });
});
