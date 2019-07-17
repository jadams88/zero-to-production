import { GraphQLResolveInfo, GraphQLFieldResolver } from 'graphql';

export type AuthMiddleware = GraphQLFieldResolver<any, any, any>;

/**
 * @param authMiddlewares
 *
 * The authenticate request function takes an array of authentication middleware, and returns a function
 * that takes a resolver function as an argument each of the auth middleware functions are called with the
 * resolver arguments. An error is thrown if any authentication process fails.D
 */
export const authenticateRequest = (authMiddlewares: AuthMiddleware[]) => {
  return (resolverFunction: GraphQLFieldResolver<any, any, any>) => {
    return async (
      parent: any,
      args: any,
      ctx: any,
      info: GraphQLResolveInfo
    ) => {
      for (const middleware of authMiddlewares) {
        /**
         * loop over there auth functions
         * If any errors occurs they will bubble up
         */
        await middleware(parent, args, ctx, info);
      }
      // Return the resolver function to be called
      return resolverFunction(parent, args, ctx, info);
    };
  };
};