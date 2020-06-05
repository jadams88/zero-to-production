import 'jest-extended';
import { Server } from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import superagent from 'superagent';
import { hash } from 'bcryptjs';
import { applyAuthRoutes } from './auth-routes';
import {
  MockUserModel,
  MockRefreshModel,
  privateKey,
  audience,
  issuer,
  MockVerifyModel,
  mockLoginConfig,
  mockVerificationConfig,
  mockRegistrationConfig,
  mockAuthorizeConfig,
  mockRefreshTokenConfig,
  mockRevokeConfig,
} from '../__tests__';
import { signRefreshToken } from '../core/tokens';
import type { AuthUser, AuthWithRefresh, Refresh, Verify } from '../types';

const URL = 'http://localhost';
const PORT = 9999;

const setupTestServer = () => {
  const app = new Koa();
  app.use(bodyParser());
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      if (e.isBoom) {
        // Is A Boom
        ctx.status = e.output.statusCode;
        ctx.body = e.output.payload;
      }
    }
  });
  return app;
};

const agentRequest = (path: string) => `${URL}:${PORT}${path}`;

const newId = () => (Math.random() * 100).toString();

const config: AuthWithRefresh<AuthUser, Verify, Refresh> = {
  login: mockLoginConfig(),
  verify: mockVerificationConfig(),
  register: mockRegistrationConfig(),
  authorize: mockAuthorizeConfig(),
  refresh: mockRefreshTokenConfig(),
  revoke: mockRevokeConfig(),
  authServerUrl: `${URL}:${PORT}`,
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
    server = app.listen(9999);
  });

  afterAll(async () => {
    server.close();
  });

  describe('/authorize/register', () => {
    it('should register a new User', async () => {
      const response = await superagent
        .post(agentRequest('/authorize/register'))
        .send({ ...user });

      expect(response.body.id).toBeDefined();
      expect(response.body.id).toBeString();
      expect(response.body.username).toEqual(user.username);
    });

    it(`should throw if User is invalid`, async () => {
      // Don't pass anything on the req.body
      await expect(
        superagent.post(agentRequest('/authorize/register'))
      ).rejects.toThrowError('Bad Request');
    });

    it('should not return the new Users password', async () => {
      const response = await superagent
        .post(agentRequest('/authorize/register'))
        .send({ ...user });

      expect(response.body.password).not.toBeDefined();
      expect(response.body.hashedPassword).not.toBeDefined();
    });
  });

  describe('/authorize/login', () => {
    it('should return an access token if correct credentials are provided', async () => {
      const userWithId = {
        ...user,
        id: newId(),
        active: true,
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((user as any).password, 10);

      MockUserModel.userToRespondWith = userWithId;

      const response = await superagent
        .post(agentRequest('/authorize/login'))
        .send(userWithId);

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeString();

      MockUserModel.reset();
    });

    it('should throw unauthorized error if the user is not found', async () => {
      const userWithId = {
        ...user,
        id: newId(),
        active: true,
      };

      MockUserModel.userToRespondWith = null;

      await expect(
        superagent
          .post(agentRequest('/authorize/login'))
          .send({ ...userWithId })
      ).rejects.toThrowError('Unauthorized');

      MockUserModel.reset();
    });

    it('should throw an unauthorized error if the user is not active', async () => {
      const userWithId = {
        ...user,
        id: newId(),
        active: false,
      };

      MockUserModel.userToRespondWith = userWithId;

      await expect(
        superagent
          .post(agentRequest('/authorize/login'))
          .send({ ...userWithId })
      ).rejects.toThrowError('Unauthorized');

      MockUserModel.reset();
    });
  });

  describe('/authorize/verify', () => {
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

      MockUserModel.userToRespondWith = unverifiedUser;
      MockVerifyModel.tokenToRespondWith = verificationToken;

      expect(MockUserModel.currentSetModel?.isVerified).toBe(false);

      const response = await superagent.get(
        agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
      );

      expect(MockUserModel.currentSetModel?.isVerified).toBe(true);

      MockVerifyModel.reset();
      MockUserModel.reset();
    });

    it('should throw if a user cannot be found', async () => {
      const userId = '1';
      const token = 'SOME_TOKEN';

      const verificationToken = {
        token,
        userId,
      };

      MockUserModel.userToRespondWith = null;
      MockVerifyModel.tokenToRespondWith = verificationToken;

      await expect(
        superagent.get(
          agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerifyModel.reset();
      MockUserModel.reset();
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

      MockUserModel.userToRespondWith = verifiedUser;
      MockVerifyModel.tokenToRespondWith = verificationToken;

      await expect(
        superagent.get(
          agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerifyModel.reset();
      MockUserModel.reset();
    });

    it('should throw if the token is not valid', async () => {
      const userId = '1';
      const token = 'SOME_TOKEN';

      const unverifiedUser = {
        id: userId,
        ...user,
        isVerified: false,
      };

      MockUserModel.userToRespondWith = unverifiedUser;
      MockVerifyModel.tokenToRespondWith = null;

      await expect(
        superagent.get(
          agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerifyModel.reset();
      MockUserModel.reset();
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

      MockUserModel.userToRespondWith = unverifiedUser;
      MockVerifyModel.tokenToRespondWith = verificationToken;

      await expect(
        superagent.get(
          agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerifyModel.reset();
      MockUserModel.reset();
    });
  });

  describe('/authorize', () => {
    it('should return an accessToken and refreshToken if the credentials correct', async () => {
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

      MockUserModel.userToRespondWith = userWithCorrectPassword;

      const response = await superagent
        .post(agentRequest('/authorize'))
        .send(userWithPassword);

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeString();
      expect(response.body.refreshToken).toBeString();

      MockUserModel.reset();
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

      MockUserModel.userToRespondWith = userWithPassword;

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

      MockUserModel.reset();
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

      MockUserModel.userToRespondWith = inactiveUser;

      await expect(
        superagent.post(agentRequest('/authorize')).send(inactiveUser)
      ).rejects.toThrowError('Unauthorized');

      MockUserModel.reset();
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
        username: userWithId.username,
        refreshToken: refreshTokenString,
      };
      const response = await superagent
        .post(agentRequest('/authorize/refresh'))
        .send(requestBody);

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeString();

      MockUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should throw a unauthorized error if invalid token provided', async () => {
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
        username: userWithId.username,
        refreshToken: 'incorrect token',
      };

      await expect(
        superagent.post(agentRequest('/authorize/refresh')).send(requestBody)
      ).rejects.toThrowError('Unauthorized');

      MockUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should throw a unauthorized errors if invalid username provided', async () => {
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
        username: 'wrong user',
        refreshToken: refreshTokenString,
      };

      await expect(
        superagent.post(agentRequest('/authorize/refresh')).send(requestBody)
      ).rejects.toThrowError('Unauthorized');

      MockUserModel.reset();
      MockRefreshModel.reset();
    });

    it('should throw a unauthorized errors if the user is not active', async () => {
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

      const requestBody = {
        username: userWithId.username,
        refreshToken: refreshTokenString,
      };

      await expect(
        superagent.post(agentRequest('/authorize/refresh')).send(requestBody)
      ).rejects.toThrowError('Unauthorized');

      // check the 'remove' handler has been called
      expect(MockRefreshModel.currentSetModel).toBe(null);

      MockUserModel.reset();
      MockRefreshModel.reset();
    });
  });

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

      MockUserModel.reset();
      MockRefreshModel.reset();
    });
  });

  describe('/authorize/available', () => {
    it('isAvailable should be true if a user with that username can not be found', async () => {
      MockUserModel.userToRespondWith = null;

      const response = await superagent.get(
        agentRequest('/authorize/available?username=username')
      );

      expect(response.body).toBeDefined();
      expect(response.body.isAvailable).toBe(true);

      MockUserModel.reset();
    });

    it('isAvailable should be false if a user with that username is found', async () => {
      const takenUsername = 'takenUsername';
      const takenUser = {
        username: takenUsername,
      } as AuthUser;

      MockUserModel.userToRespondWith = takenUser;

      const response = await superagent.get(
        agentRequest(`/authorize/available?username=${takenUsername}`)
      );

      expect(response.body).toBeDefined();
      expect(response.body.isAvailable).toBe(false);

      MockUserModel.reset();
    });
  });
});
