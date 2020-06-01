import 'jest-extended';
import { IUser } from '@ztp/data';
import { GraphQLSchema, graphql } from 'graphql';
import { createAuthSchema } from './schema';
import { getAuthResolvers } from './auth-resolvers';
import { LoginAndRegisterConfig } from '../auth.interface';
import {
  mockLoginConfig,
  mockRegistrationConfig,
  mockVerificationConfig,
} from '../__tests__/setup';
import { Types } from 'mongoose';
import { hash } from 'bcryptjs';
import { MockUserModel } from '../__tests__/user.mock';

export const runQuery = (schema: GraphQLSchema) => {
  return async (query: string, variables: { [prop: string]: any }) => {
    return graphql(schema, query, null, {}, variables);
  };
};

const email: jest.Mock<any, any> = jest.fn();

const config: LoginAndRegisterConfig = {
  login: mockLoginConfig(),
  verify: mockVerificationConfig(),
  register: mockRegistrationConfig(),
  email,
};

const resolvers = getAuthResolvers(config);
const schema = createAuthSchema(resolvers);

const user: IUser = ({
  username: 'test user',
  givenName: 'test',
  surname: 'user',
  email: 'test@domain.com',
  dateOfBirth: '2019-01-01',
  password: 'SomE$2jDA',
} as any) as IUser;

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
        id: Types.ObjectId().toHexString(),
        active: true,
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((user as any).password, 10);

      MockUserModel.modelToRespondWith = userWithId;

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

      MockUserModel.reset();
    });

    it('should throw unauthorized error if the user is not found', async () => {
      MockUserModel.modelToRespondWith = null;

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

      MockUserModel.reset();
    });

    it('should throw unauthorized error if the credentials are incorrect', async () => {
      const userWithId = {
        ...user,
        id: Types.ObjectId().toHexString(),
        active: true,
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((user as any).password, 10);

      MockUserModel.modelToRespondWith = userWithId;

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

      MockUserModel.reset();
    });

    it('should throw an unauthorized error if the user is not active', async () => {
      const userWithId = {
        ...user,
        id: Types.ObjectId().toHexString(),
        active: false,
      };

      // Set the hashed password to be correct
      userWithId.hashedPassword = await hash((user as any).password, 10);

      MockUserModel.modelToRespondWith = userWithId;

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

      MockUserModel.reset();
    });
  });

  describe('userAvailable(username: String!): UserAvailable!', () => {
    it('isAvailable should be true if a user with that username can not be found', async () => {
      MockUserModel.modelToRespondWith = null;

      const queryName = `userAvailable`;
      const result = await runQuery(schema)(
        `
        query IsAvailable($username: String!) {
          ${queryName}(username: $username) {
            isAvailable
          }
        }
        `,
        {
          username: user.username,
        }
      );

      expect(result.errors).not.toBeDefined();
      expect((result.data as any)[queryName]).toBeObject();
      expect((result.data as any)[queryName].isAvailable).toBe(true);
      MockUserModel.reset();
    });

    it('isAvailable should be false if a user with that username is found', async () => {
      const takenUsername = 'takenUsername';
      const user = {
        username: takenUsername,
      } as IUser;

      MockUserModel.modelToRespondWith = user;

      const queryName = `userAvailable`;
      const result = await runQuery(schema)(
        `
        query IsAvailable($username: String!) {
          ${queryName}(username: $username) {
            isAvailable
          }
        }
        `,
        {
          username: takenUsername,
        }
      );

      expect(result.errors).not.toBeDefined();
      expect((result.data as any)[queryName]).toBeObject();
      expect((result.data as any)[queryName].isAvailable).toBe(false);

      MockUserModel.reset();
    });
  });
});
