import 'jest-extended';
import { Server } from 'http';
import superagent from 'superagent';
import { hash } from 'bcryptjs';
import { applyAuthRoutes } from './routes';
import {
  MockAuthUserModel,
  MockRefreshModel,
  privateKey,
  audience,
  issuer,
  MockVerifyModel,
  mockVerificationConfig,
  mockRegistrationConfig,
  mockAuthorizeConfig,
  mockRefreshTokenConfig,
  mockRevokeConfig,
  request,
  setupTestServer,
  newId,
} from '../__tests__';
import { signRefreshToken } from '../core/tokens';
import type { AuthUser, Refresh, Verify, AuthModuleConfig } from '../types';

const URL = 'http://localhost';
const PORT = 9999;

const agentRequest = request(URL, PORT);

const config: AuthModuleConfig<AuthUser, Refresh, Verify> = {
  verify: mockVerificationConfig(),
  register: mockRegistrationConfig(),
  authorize: mockAuthorizeConfig(),
  refresh: mockRefreshTokenConfig(),
  revoke: mockRevokeConfig(),
  authServerHost: `${URL}:${PORT}`,
};

const user = ({
  username: 'test user',
  givenName: 'test',
  surname: 'user',
  email: 'test@domain.com',
  dateOfBirth: '2019-01-01',
  password: 'SomE$2jDA',
} as any) as AuthUser;

describe('Router - Auth', () => {
  let server: Server;

  beforeAll(async () => {
    const app = setupTestServer();
    app.use(applyAuthRoutes(config));
    server = app.listen(PORT);
  });

  afterAll(async () => {
    server.close();
  });

  describe('/register', () => {
    it('should register a new User', async () => {
      const response = await superagent
        .post(agentRequest('/register'))
        .send({ ...user });

      expect(response.body.id).toBeDefined();
      expect(response.body.id).toBeString();
      expect(response.body.username).toEqual(user.username);
    });

    it(`should throw if User is invalid`, async () => {
      // Don't pass anything on the req.body
      await expect(
        superagent.post(agentRequest('/register'))
      ).rejects.toThrowError('Bad Request');
    });

    it('should not return the new Users password', async () => {
      const response = await superagent
        .post(agentRequest('/register'))
        .send({ ...user });

      expect(response.body.password).not.toBeDefined();
      expect(response.body.hashedPassword).not.toBeDefined();
    });
  });

  describe('/verify', () => {
    it('should verify a users email', async () => {
      const userId = '1';
      const token = 'SOME_TOKEN';

      const unverifiedUser = {
        id: userId,
        ...user,
        isVerified: false,
      };

      const verificationToken = {
        token,
        userId,
      };

      MockAuthUserModel.userToRespondWith = unverifiedUser;
      MockVerifyModel.tokenToRespondWith = verificationToken;

      expect(MockAuthUserModel.currentSetModel?.isVerified).toBe(false);

      const response = await superagent.get(
        agentRequest(`/verify?token=${token}&email=${user.email}`)
      );

      expect(MockAuthUserModel.currentSetModel?.isVerified).toBe(true);

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });

    it('should throw if a user cannot be found', async () => {
      const userId = '1';
      const token = 'SOME_TOKEN';

      const verificationToken = {
        token,
        userId,
      };

      MockAuthUserModel.userToRespondWith = null;
      MockVerifyModel.tokenToRespondWith = verificationToken;

      await expect(
        superagent.get(
          agentRequest(`/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });

    it('should throw if the user is already valid', async () => {
      const userId = '1';
      const token = 'SOME_TOKEN';

      const verifiedUser = {
        id: userId,
        ...user,
        isVerified: true,
      };

      const verificationToken = {
        token,
        userId,
      };

      MockAuthUserModel.userToRespondWith = verifiedUser;
      MockVerifyModel.tokenToRespondWith = verificationToken;

      await expect(
        superagent.get(
          agentRequest(`/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });

    it('should throw if the token is not valid', async () => {
      const userId = '1';
      const token = 'SOME_TOKEN';

      const unverifiedUser = {
        id: userId,
        ...user,
        isVerified: false,
      };

      MockAuthUserModel.userToRespondWith = unverifiedUser;
      MockVerifyModel.tokenToRespondWith = null;

      await expect(
        superagent.get(
          agentRequest(`/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });

    it('should throw if the token does not belong to the user', async () => {
      const token = 'SOME-TOKEN';

      const unverifiedUser = {
        id: '1',
        ...user,
        isVerified: false,
      };

      const verificationToken = {
        token,
        userId: '2',
      };

      MockAuthUserModel.userToRespondWith = unverifiedUser;
      MockVerifyModel.tokenToRespondWith = verificationToken;

      await expect(
        superagent.get(
          agentRequest(`/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });
  });

  describe('/authorize', () => {
    it('should return an accessToken if the credentials correct', async () => {
      const hashedPassword = await hash((user as any).password, 10);

      const userWithPassword = {
        ...user,
        id: newId(),
        active: true,
      };

      const userWithCorrectPassword = {
        ...userWithPassword,
        password: undefined,
        hashedPassword,
      };

      MockAuthUserModel.userToRespondWith = userWithCorrectPassword;

      const response = await superagent
        .post(agentRequest('/authorize'))
        .send(userWithPassword);

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeString();
      expect(response.body.expiresIn).toBeNumber();

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should throw unauthorized error if the credentials are incorrect', async () => {
      const hashedPassword = await hash((user as any).password, 10);

      const userWithPassword = {
        ...user,
        id: newId(),
        active: true,
        hashedPassword,
      };

      const userWithIncorrectUsername = {
        ...userWithPassword,
        username: 'wrong username',
        hashedPassword: undefined,
      };

      const userWithIncorrectCorrectPassword = {
        ...userWithPassword,
        password: 'Wrong Password',
        hashedPassword: undefined,
      };

      MockAuthUserModel.userToRespondWith = userWithPassword;

      await expect(
        superagent
          .post(agentRequest('/authorize'))
          .send(userWithIncorrectUsername)
      ).rejects.toThrowError('Unauthorized');

      await expect(
        superagent
          .post(agentRequest('/authorize'))
          .send(userWithIncorrectCorrectPassword)
      ).rejects.toThrowError('Unauthorized');

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should throw an unauthorized error if the user is not active', async () => {
      const hashedPassword = await hash((user as any).password, 10);

      const inactiveUser = {
        ...user,
        id: newId(),
        active: false,
        hashedPassword,
      };

      MockAuthUserModel.userToRespondWith = inactiveUser;

      await expect(
        superagent.post(agentRequest('/authorize')).send(inactiveUser)
      ).rejects.toThrowError('Unauthorized');

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });
  });

  describe('/authorize/refresh', () => {
    it('should return a new access token when the a valid refresh token is provided', async () => {
      const userWithId = {
        ...user,
        id: newId(),
        active: true,
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

      const requestBody = {
        refreshToken: refreshTokenString,
      };
      const response = await superagent
        .post(agentRequest('/authorize/refresh'))
        .send(requestBody);

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeString();

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should return a new access token when the a valid refresh token is provided as cookie', async () => {
      const userWithId = {
        ...user,
        id: newId(),
        active: true,
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

      const response = await superagent
        .post(agentRequest('/authorize/refresh'))
        .set('Cookie', [`refresh_token=${refreshTokenString}`])
        .send();

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeString();

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should not return a token if an invalid refresh token is provided', async () => {
      const userWithId = {
        ...user,
        id: newId(),
        active: true,
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

      const response = await superagent
        .post(agentRequest('/authorize/refresh'))
        .set('Cookie', [`refresh_token=incorrect_token`])
        .send();

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeNull();

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should not return a token if the user is not active', async () => {
      const userWithId = {
        ...user,
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

      const response = await superagent
        .post(agentRequest('/authorize/refresh'))
        .set('Cookie', [`refresh_token=${refreshTokenString}`])
        .send();

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeNull();

      MockAuthUserModel.reset();
      MockRefreshModel.reset();

      // check the 'remove' handler has been called
      expect(MockRefreshModel.currentSetModel).toBe(null);

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });
  });

  //   it('should throw a unauthorized error if invalid token provided', async () => {
  //     const userWithId = {
  //       ...user,
  //       id: newId(),
  //       active: true,
  //     };

  //     const refreshTokenString = signRefreshToken({
  //       privateKey,
  //       audience,
  //       issuer,
  //     })(userWithId);

  //     const refreshToken = {
  //       user: {
  //         id: userWithId.id,
  //         username: userWithId.username,
  //         active: true,
  //       } as AuthUser,
  //       token: refreshTokenString,
  //     };

  //     MockRefreshModel.tokenToRespondWith = refreshToken;

  //     const requestBody = {
  //       refreshToken: 'incorrect token',
  //     };

  //     await expect(
  //       superagent.post(agentRequest('/authorize/refresh')).send(requestBody)
  //     ).rejects.toThrowError('Unauthorized');

  //     MockAuthUserModel.reset();
  //     MockRefreshModel.reset();
  //   });

  //   it('should throw a unauthorized errors if the user is not active', async () => {
  //     const userWithId = {
  //       ...user,
  //       id: newId(),
  //       active: false,
  //     };

  //     const refreshTokenString = signRefreshToken({
  //       privateKey,
  //       audience,
  //       issuer,
  //     })(userWithId);

  //     const refreshToken = {
  //       user: {
  //         id: userWithId.id,
  //         username: userWithId.username,
  //         active: false,
  //       } as AuthUser,
  //       token: refreshTokenString,
  //     };

  //     MockRefreshModel.tokenToRespondWith = refreshToken;

  //     const requestBody = {
  //       username: userWithId.username,
  //       refreshToken: refreshTokenString,
  //     };

  //     await expect(
  //       superagent.post(agentRequest('/authorize/refresh')).send(requestBody)
  //     ).rejects.toThrowError('Unauthorized');

  //     // check the 'remove' handler has been called
  //     expect(MockRefreshModel.currentSetModel).toBe(null);

  //     MockAuthUserModel.reset();
  //     MockRefreshModel.reset();
  //   });
  // });

  describe('/authorize/revoke', () => {
    it('should revoke the refresh token provided', async () => {
      const userWithId = {
        ...user,
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

      const requestBody = {
        refreshToken: refreshTokenString,
      };

      const response = await superagent
        .post(agentRequest('/authorize/revoke'))
        .send(requestBody);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);

      // check if remove was called
      expect(MockRefreshModel.currentSetModel).toBe(null);

      MockAuthUserModel.reset();
      MockRefreshModel.reset();
    });
  });
});
