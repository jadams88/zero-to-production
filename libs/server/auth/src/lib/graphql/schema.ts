import { makeExecutableSchema } from 'apollo-server-koa';
import { AuthUser, Verify, Refresh, AuthModuleConfig } from '../types';
import { getAuthResolvers } from './resolvers';
import { authTypeDef } from './type-def';

export function createAuthSchema<
  U extends AuthUser,
  R extends Refresh,
  V extends Verify
>(config: AuthModuleConfig<U, R, V>) {
  const resolvers = getAuthResolvers(config);

  return makeExecutableSchema({
    typeDefs: authTypeDef,
    resolvers,
    allowUndefinedInResolve: false,
  });
}
