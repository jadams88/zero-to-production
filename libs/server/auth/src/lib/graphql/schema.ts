import { makeExecutableSchema } from 'apollo-server-koa';
import { getAuthTypeDef } from './type-def';
import {
  AuthUser,
  Verify,
  BasicAuthModule,
  AuthWithValidation,
} from '../types';
import { getAuthResolvers } from './resolvers';
import { GraphQLSchema } from 'graphql';

export function createAuthSchema<U extends AuthUser>(
  config: BasicAuthModule<U>
): GraphQLSchema;
export function createAuthSchema<U extends AuthUser, V extends Verify>(
  config: AuthWithValidation<U, V>
): GraphQLSchema;
export function createAuthSchema<U extends AuthUser, V extends Verify>(
  config: BasicAuthModule<U> | AuthWithValidation<U, V>
) {
  const resolvers = getAuthResolvers(config);
  const typeDefs = getAuthTypeDef(config);

  return makeExecutableSchema({
    typeDefs,
    resolvers,
    allowUndefinedInResolve: false,
  });
}
