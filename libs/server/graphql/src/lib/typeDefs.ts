import { DocumentNode } from 'graphql';
import { gql, ITypeDefinitions } from 'apollo-server-koa';

/**
 * This is base schema definition. All API type definitions are merged with this one.
 * Because all of the API sits behind authentication, we can add the @authenticated schema directive to
 * the 'Query' and `Mutation` types, and the directive will be added to each query.
 *
 * Note that Schema stitching is used to merge the Authentication GraphQL schema. That schema should
 * NOT require authentication, hence the type 'Query' and 'Mutation' should not have the @authenticated directive
 *
 */
export const baseTypeDef = gql`
  scalar Date
  scalar Time
  scalar DateTime
  scalar Upload

  directive @formatDate(format: String = "yyyy-MM-dd") on FIELD_DEFINITION
  directive @authenticate on OBJECT | FIELD_DEFINITION
  directive @isActiveUser on OBJECT | FIELD_DEFINITION

  type File {
    id: ID!
    path: String!
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query @authenticate
  type Mutation @authenticate
  # type Subscription

  schema {
    query: Query
    mutation: Mutation
    # subscription: Subscription
  }
`;

export function createTypeDefs(...typeDefs: DocumentNode[]): ITypeDefinitions {
  return [baseTypeDef, ...typeDefs];
}
