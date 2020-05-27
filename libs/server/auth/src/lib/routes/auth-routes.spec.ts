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

const URL = 'http://localhost';
const PORT = 9999;

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

describe('AuthRoutes', () => {
  let server: Server;

  beforeAll(async () => {
    const app = new Koa();
    app.use(bodyParser());
    app.use(applyAuthRoutes(config));
    server = app.listen(9999);
  });

  afterAll(async () => {
    server.close();
  });

  describe('register', () => {
    it('should register a new User', async () => {
      const response = await superagent
        .post(agentRequest('/authorize/register'))
        .send({ ...user });

      expect(response.body.id).toBeDefined();
      expect(response.body.id).toBeString();
      expect(response.body.username).toEqual(user.username);
    });

    it(`should throw if User is invalid`, async () => {
      const newUser = {
        ...user,
        email: 10,
        ignoredProperty: 'this is not allowed',
      };

      await expect(
        superagent.post(agentRequest('/authorize/register'))
      ).rejects.toThrowError();
    });

    it('should not return the new Users password', async () => {
      const response = await superagent
        .post(agentRequest('/authorize/register'))
        .send({ ...user });

      expect(response.body.password).not.toBeDefined();
      expect(response.body.hashedPassword).not.toBeDefined();
    });
  });
});
