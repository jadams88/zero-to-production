import { gql, ITypeDefinitions } from 'apollo-server-koa';
import { includeEmailVerification } from '../core';
import {
  BasicAuthModule,
  AuthUser,
  Verify,
  AuthWithValidation,
} from '../types';

export const baseAuhTypeDef = gql`
  type AuthPayload {
    token: String!
    expiresIn: Int!
  }

  input RegisterInput {
    givenName: String!
    surname: String!
    username: String!
    email: String!
    dateOfBirth: String!
    password: String!
  }

  type RegisterSuccess {
    id: ID!
    givenName: String!
    surname: String!
    username: String!
    email: String!
    dateOfBirth: String!
  }

  type UserAvailable {
    isAvailable: Boolean!
  }

  type Query {
    userAvailable(username: String!): UserAvailable!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    register(input: RegisterInput!): RegisterSuccess!
  }
`;

export const verifyTypeDef = gql`
  type VerifyUser {
    message: String!
  }

  extend type Query {
    verify(email: String!, token: String!): VerifyUser!
  }
`;

export function getAuthTypeDef<U extends AuthUser>(
  config: BasicAuthModule<U>
): ITypeDefinitions;
export function getAuthTypeDef<U extends AuthUser, V extends Verify>(
  config: AuthWithValidation<U, V>
): ITypeDefinitions;
export function getAuthTypeDef<U extends AuthUser, V extends Verify>(
  config: BasicAuthModule<U> | AuthWithValidation<U, V>
): ITypeDefinitions {
  const { register } = config as AuthWithValidation<U, V>;

  // registration resolver if using email verification
  if (includeEmailVerification(register)) {
    return [baseAuhTypeDef, verifyTypeDef];
  } else {
    return [baseAuhTypeDef];
  }
}
