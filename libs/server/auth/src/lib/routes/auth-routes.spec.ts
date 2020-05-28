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
import { MockUserModel, MockVerificationToken } from '../__tests__';

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

      // const setVerifiedValue = jest.fn();
      // const removeVerificationToken = jest.fn();

      const unverifiedUser = {
        id: userId,
        isVerified: false,
        ...user,
      };

      MockUserModel.userToRespondWith = unverifiedUser;

      const verificationToken = {
        token,
        userId,
      };

      MockVerificationToken.tokenToRespondWith = verificationToken;

      // const { message } = await mockVerificationController()(
      //   userToRegister.email,
      //   token
      // );

      const mUser = MockUserModel.currentUser;
      console.error(mUser);
      expect(MockUserModel.currentUser?.isVerified).toBe(false);

      console.error(`/authorize/verify?token=${token}&email=${user.email}`);

      try {
        const response = await superagent.get(
          agentRequest(`/authorize/verify?token=${token}&email=${user.email}`)
        );
      } catch (e) {
        console.error(e);
      }

      expect(MockUserModel.currentUser?.isVerified).toBe(true);

      // expect(setVerifiedValue).toHaveBeenCalled();
      // expect(setVerifiedValue.mock.calls[0][0]).toEqual({ isVerified: true });
      // expect(removeVerificationToken).toHaveBeenCalled();

      MockVerificationToken.reset();
      MockUserModel.reset();
    });
  });
});
