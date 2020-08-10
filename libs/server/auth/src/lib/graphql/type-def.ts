import { gql } from 'apollo-server-koa';

export const authTypeDef = gql`
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

  type RevokeRefreshToken {
    success: Boolean!
  }

  type VerifyUser {
    message: String!
  }

  type Query {
    verify(email: String!, token: String!): VerifyUser!
  }

  type Mutation {
    authorize(username: String!, password: String!): AuthPayload!
    register(input: RegisterInput!): RegisterSuccess!
  }
`;
