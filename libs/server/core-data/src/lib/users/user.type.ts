import { gql } from 'apollo-server-koa';

export const userTypeDef = gql`
  type User {
    id: ID!
    givenName: String!
    surname: String!
    username: String!
    email: String!
    dateOfBirth: String!
    isVerified: Boolean!
  }

  input UpdatedUserInput {
    id: ID!
    givenName: String
    surname: String
    username: String
    email: String
    dateOfBirth: String
  }

  extend type Query {
    User(id: ID!): User!
    allUsers: [User]!
  }

  extend type Mutation {
    updateUser(input: UpdatedUserInput!): User!
    removeUser(id: ID!): User!
  }
`;
