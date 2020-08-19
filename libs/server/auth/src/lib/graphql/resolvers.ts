import { GraphQLFieldResolver } from 'graphql';
import { IResolvers } from 'apollo-server-koa';
import {
  setupRegisterController,
  setupVerifyController,
  setupAuthorizeController,
} from '../core';
import {
  AuthUser,
  VerifyController,
  Verify,
  Refresh,
  AuthorizeController,
  AuthModuleConfig,
  RegisterController,
} from '../types';

export type TResolver = GraphQLFieldResolver<any, any, any>;

export interface AuthResolvers extends IResolvers {
  Query: {
    verify: TResolver;
  };
  Mutation: {
    authorize: TResolver;
    register: TResolver;
  };
}

export function getAuthResolvers<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(config: AuthModuleConfig<U, R, V>): AuthResolvers {
  const { register, verify, authorize, refresh, revoke } = config;

  return {
    Query: {
      verify: verifyResolver(verify),
    },
    Mutation: {
      authorize: authorizeResolver(authorize),
      register: registerResolver(register),
    },
  };
}

export function registerResolver<U extends AuthUser, V extends Verify>(
  config: RegisterController<U, V>
): GraphQLFieldResolver<any, { input: AuthUser }, any> {
  const registerController = setupRegisterController(config);
  return function register(root, args, ctx, i) {
    return registerController(args.input);
  };
}

export function verifyResolver<U extends AuthUser, V extends Verify>(
  config: VerifyController<U, V>
): GraphQLFieldResolver<any, { email: string; token: string }, any> {
  const verifyController = setupVerifyController(config);

  return function verify(root, args, ctx, i): Promise<{ message: string }> {
    const email: string = args.email;
    const token: string = args.token;

    return verifyController(email, token);
  };
}

export function authorizeResolver<U extends AuthUser, R extends Refresh>(
  config: AuthorizeController<U, R>
): GraphQLFieldResolver<
  any,
  { email: string; token: string; cookies: any },
  any
> {
  const authorizeController = setupAuthorizeController(config);

  return (root, args, ctx, i) => {
    const username: string = args.username;
    const password: string = args.password;

    return authorizeController(username, password, ctx.cookies);
  };
}
