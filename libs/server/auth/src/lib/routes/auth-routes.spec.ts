import 'jest-extended';
import { Server } from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import superagent from 'superagent';
import { AuthWithRefreshTokenConfig } from '../auth.interface';
import { applyAuthRoutes } from './auth-routes';
import {
  mockLoginConfig,
  mockVerificationConfig,
  mockRegistrationConfig,
  mockAuthorizeConfig,
  mockRefreshTokenConfig,
  mockRevokeConfig,
} from '../__tests__/setup';
import { IUser } from '@ztp/data';
import { Types } from 'mongoose';
import { hash } from 'bcryptjs';
import {
  MockUserModel,
  MockVerificationToken,
  MockRefreshTokenModel,
} from '../__tests__';

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

const email: jest.Mock<any, any> = jest.fn();

const config: AuthWithRefreshTokenConfig = {
  login: mockLoginConfig(),
  verify: mockVerificationConfig(),
  register: mockRegistrationConfig(),
  authorize: mockAuthorizeConfig(),
  refresh: mockRefreshTokenConfig(),
  revoke: mockRevokeConfig(),
  email,
};

const user: IUser = ({
  username: 'test user',
  givenName: 'test',
  surname: 'user',
  email: 'test@domain.com',
  dateOfBirth: '2019-01-01',
  password: 'SomE$2jDA',
} as any) as IUser;

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
        id: Types.ObjectId().toHexString(),
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
        id: Types.ObjectId().toHexString(),
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
        id: Types.ObjectId().toHexString(),
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
      MockVerificationToken.tokenToRespondWith = verificationToken;

      expect(MockUserModel.currentSetModel?.isVerified).toBe(false);

      const response = await superagent.get(
        agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
      );

      expect(MockUserModel.currentSetModel?.isVerified).toBe(true);

      MockVerificationToken.reset();
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
      MockVerificationToken.tokenToRespondWith = verificationToken;

      await expect(
        superagent.get(
          agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerificationToken.reset();
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
      MockVerificationToken.tokenToRespondWith = verificationToken;

      await expect(
        superagent.get(
          agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerificationToken.reset();
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
      MockVerificationToken.tokenToRespondWith = null;

      await expect(
        superagent.get(
          agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerificationToken.reset();
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
      MockVerificationToken.tokenToRespondWith = verificationToken;

      await expect(
        superagent.get(
          agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
        )
      ).rejects.toThrowError('Bad Request');

      MockVerificationToken.reset();
      MockUserModel.reset();
    });
  });

  describe('/authorize', () => {
    it('should return an accessToken and refreshToken if the credentials correct', async () => {
      const hashedPassword = await hash((user as any).password, 10);

      const userWithId = {
        ...user,
        id: Types.ObjectId().toHexString(),
        active: true,
        hashedPassword,
      };

      MockUserModel.userToRespondWith = userWithId;

      const response = await superagent
        .post(agentRequest('/authorize'))
        .send(userWithId);

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeString();
      expect(response.body.refreshToken).toBeString();

      MockUserModel.reset();
      MockRefreshTokenModel.reset();
    });

    // it('should throw unauthorized error if the credentials are incorrect', async () => {
    //   const userWithId = {
    //     ...userWithPassword,
    //     id: newId(),
    //   };

    //   // Set the hashed password to be correct
    //   userWithId.hashedPassword = await hash((userWithId as any).password, 10);

    //   MockUserModel.userToRespondWith = userWithId;

    //   await expect(
    //     mockAuthorizeController()(userWithId.username, 'somWrongPassword')
    //   ).rejects.toThrowError('Unauthorized');

    //   await expect(
    //     mockAuthorizeController()(
    //       'someWrongUsername',
    //       (userWithId as any).password
    //     )
    //   ).rejects.toThrowError('Unauthorized');
    // });

    // it('should throw an unauthorized error if the user is not active', async () => {
    //   const inactiveUser = {
    //     ...userWithPassword,
    //     id: newId(),
    //     active: false,
    //   };

    //   // Set the hashed password to be correct
    //   inactiveUser.hashedPassword = await hash(
    //     (inactiveUser as any).password,
    //     10
    //   );

    //   MockUserModel.userToRespondWith = inactiveUser;

    //   await expect(
    //     mockAuthorizeController()(
    //       inactiveUser.username,
    //       (inactiveUser as any).password
    //     )
    //   ).rejects.toThrowError('Unauthorized');

    //   MockUserModel.reset();
    //   MockRefreshTokenModel.reset();
    // });
  });
});
