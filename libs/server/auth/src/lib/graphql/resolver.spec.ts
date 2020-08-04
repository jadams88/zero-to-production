import { hash } from 'bcryptjs';
import 'jest-extended';
import { GraphQLSchema, graphql } from 'graphql';
import { ApolloServer } from 'apollo-server-koa';
import superagent from 'superagent';
import { createAuthSchema } from './schema';
import {
  mockLoginConfig,
  mockRegistrationConfig,
  mockVerificationConfig,
  MockVerifyModel,
  MockAuthUserModel,
  setupTestServer,
} from '../__tests__';
import { AuthUser, AuthWithValidation, Verify } from '../types';
import { Server } from 'http';
import { graphQLVerifyUrl } from './utils';

const URL = 'http://localhost';
const PORT = 9998;

export const runQuery = (sc: GraphQLSchema) => {
  return async (query: string, variables: { [prop: string]: any }) => {
    return graphql(sc, query, null, {}, variables);
  };
};

const config: AuthWithValidation<AuthUser, Verify> = {
  login: mockLoginConfig(),
  verify: mockVerificationConfig(),
  register: mockRegistrationConfig(),
  authServerHost: 'http://some-url.com',
};

const schema = createAuthSchema(config);

const user = ({
  username: 'test user',
  givenName: 'test',
  surname: 'user',
  email: 'test@domain.com',
  dateOfBirth: '2019-01-01',
  password: 'SomE$2jDA',
} as any) as AuthUser;

describe(`GraphQL - Auth Queries`, () => {
  describe(`register(input: RegisterInput!): RegisterSuccess!`, () => {
    it(`should register a new User`, async () => {
      const queryName = `register`;
      const result = await runQuery(schema)(
        `
         mutation Register($input: RegisterInput!) {
            ${queryName}(input: $input) {
                id
                username
            }
        }
        `,
        { input: user }
      );

      expect(result.errors).not.toBeDefined();
      expect((result.data as any)[queryName]).toBeObject();
      expect((result.data as any)[queryName].id).toBeString();
      expect((result.data as any)[queryName].username).toEqual(user.username);
      expect((result.data as any)[queryName].password).not.toBeDefined();
      expect((result.data as any)[queryName].hashedPassword).not.toBeDefined();
    });

    it(`should throw if User is invalid`, async () => {
      const newUser = { ...user, invalidProperty: 'this is not allowed' };
      const queryName = `register`;
      const result = await runQuery(schema)(
        `
         mutation Register($input: RegisterInput!) {
            ${queryName}(input: $input) {
                id
                username
            }
        }
        `,
        { input: newUser }
      );

      expect(result.data).not.toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should not query the new Users password', async () => {
      const queryName = `register`;
      const result = await runQuery(schema)(
        `
         mutation Register($input: RegisterInput!) {
            ${queryName}(input: $input) {
                id
                username
                password
            }
        }
        `,
        { input: user }
      );

      expect(result.errors).toBeDefined();
    });

    it('should not query the new Users hashedPassword', async () => {
      const queryName = `register`;
      const result = await runQuery(schema)(
        `
         mutation Register($input: RegisterInput!) {
            ${queryName}(input: $input) {
                id
                username
                hashedPassword
            }
        }
        `,
        { input: user }
      );

      expect(result.errors).toBeDefined();
    });
  });

  describe('login(username: String!, password: String!): AuthPayload!', () => {
    it('should return an access token if correct credentials are provided', async () => {
      const userWithId = {
        ...user,
        id: 'some-id',
        active: true,
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((user as any).password, 10);

      MockAuthUserModel.userToRespondWith = userWithId;

      const queryName = `login`;
      const result = await runQuery(schema)(
        `
        mutation Login($username: String!, $password: String!) {
          ${queryName}(username: $username, password: $password) {
            token
          }
        }
        `,
        {
          username: user.username,
          password: (user as any).password,
        }
      );

      expect(result.errors).not.toBeDefined();
      expect(result.data).toBeDefined();
      const token = (result.data as any)[queryName].token;

      expect(token).toBeDefined();
      expect(token).toBeString();

      MockAuthUserModel.reset();
    });

    it('should throw unauthorized error if the user is not found', async () => {
      MockAuthUserModel.userToRespondWith = null;

      const queryName = `login`;
      const result = await runQuery(schema)(
        `
        mutation Login($username: String!, $password: String!) {
          ${queryName}(username: $username, password: $password) {
            token
          }
        }
        `,
        {
          username: user.username,
          password: (user as any).password,
        }
      );

      expect(result.data).toBe(null);
      expect(result.errors).toBeDefined();
      expect((result.errors as any)[0].message).toBe('Unauthorized');

      MockAuthUserModel.reset();
    });

    it('should throw unauthorized error if the credentials are incorrect', async () => {
      const userWithId = {
        ...user,
        id: 'some-id',
        active: true,
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((user as any).password, 10);

      MockAuthUserModel.userToRespondWith = userWithId;

      const queryName = `login`;
      const result = await runQuery(schema)(
        `
        mutation Login($username: String!, $password: String!) {
          ${queryName}(username: $username, password: $password) {
            token
          }
        }
        `,
        {
          username: user.username,
          password: 'wrong$password',
        }
      );

      expect(result.data).toBe(null);
      expect(result.errors).toBeDefined();
      expect((result.errors as any)[0].message).toBe('Unauthorized');

      MockAuthUserModel.reset();
    });

    it('should throw an unauthorized error if the user is not active', async () => {
      const userWithId = {
        ...user,
        id: 'some-id',
        active: false,
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((user as any).password, 10);

      MockAuthUserModel.userToRespondWith = userWithId;

      const queryName = `login`;
      const result = await runQuery(schema)(
        `
        mutation Login($username: String!, $password: String!) {
          ${queryName}(username: $username, password: $password) {
            token
          }
        }
        `,
        {
          username: user.username,
          password: (user as any).password,
        }
      );

      expect(result.data).toBe(null);
      expect(result.errors).toBeDefined();
      expect((result.errors as any)[0].message).toBe('Unauthorized');

      MockAuthUserModel.reset();
    });
  });

  describe('verify(email: String!, token: String!): VerifyUser!', () => {
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

      const queryName = `verify`;
      const result = await runQuery(schema)(
        `
        query Verify($email: String!, $token: String!) {
          ${queryName}(email: $email, token: $token) {
            message
          }
        }
        `,
        {
          email: user.email,
          token,
        }
      );

      expect(result.errors).not.toBeDefined();
      expect(result.data).toBeDefined();

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

      const queryName = `verify`;
      const result = await runQuery(schema)(
        `
        query Verify($email: String!, $token: String!) {
          ${queryName}(email: $email, token: $token) {
            message
          }
        }
        `,
        {
          email: user.email,
          token,
        }
      );

      expect(result.data).toBe(null);
      expect(result.errors).toBeDefined();

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

      const queryName = `verify`;
      const result = await runQuery(schema)(
        `
        query Verify($email: String!, $token: String!) {
          ${queryName}(email: $email, token: $token) {
            message
          }
        }
        `,
        {
          email: user.email,
          token,
        }
      );

      expect(result.data).toBe(null);
      expect(result.errors).toBeDefined();

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

      const queryName = `verify`;
      const result = await runQuery(schema)(
        `
        query Verify($email: String!, $token: String!) {
          ${queryName}(email: $email, token: $token) {
            message
          }
        }
        `,
        {
          email: user.email,
          token,
        }
      );

      expect(result.data).toBe(null);
      expect(result.errors).toBeDefined();

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

      const queryName = `verify`;
      const result = await runQuery(schema)(
        `
        query Verify($email: String!, $token: String!) {
          ${queryName}(email: $email, token: $token) {
            message
          }
        }
        `,
        {
          email: user.email,
          token,
        }
      );

      expect(result.data).toBe(null);
      expect(result.errors).toBeDefined();

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });
  });

  describe('verify - GET Request', () => {
    let server: Server;

    beforeAll(async () => {
      const app = setupTestServer();

      const apollo = new ApolloServer({
        schema,
        playground: false,
        tracing: false,
        debug: false,
        uploads: false,
      });

      apollo.applyMiddleware({ app });

      server = app.listen(PORT);
    });

    afterAll(async () => {
      server.close();
    });

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

      const urlQuery = graphQLVerifyUrl(`${URL}:${PORT}`)(user.email, token);

      expect(MockAuthUserModel.currentSetModel?.isVerified).toBe(false);

      const response = await superagent.get(urlQuery);

      expect(MockAuthUserModel.currentSetModel?.isVerified).toBe(true);

      MockVerifyModel.reset();
      MockAuthUserModel.reset();
    });
  });
});
