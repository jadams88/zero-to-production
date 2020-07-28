import { GraphQLFieldResolver } from 'graphql';
import {
  setupLoginController,
  setupRegisterController,
  setupVerifyController,
  includeEmailVerification,
} from '../core';
import {
  LoginController,
  BasicAuthModule,
  AuthUser,
  BasicRegistrationController,
  VerifyController,
  Verify,
  AuthWithValidation,
} from '../types';
import { IResolvers } from 'apollo-server-koa';

export type TResolver = GraphQLFieldResolver<any, any, any>;

export interface SimpleAuthResolvers extends IResolvers {
  Mutation: { register: TResolver; login: TResolver };
}

export interface AuthWithVerify extends SimpleAuthResolvers {
  Query: { verify: TResolver };
}

export function getAuthResolvers<U extends AuthUser>(
  config: BasicAuthModule<U>
): SimpleAuthResolvers;
export function getAuthResolvers<U extends AuthUser, V extends Verify>(
  config: AuthWithValidation<U, V>
): AuthWithVerify;
export function getAuthResolvers<U extends AuthUser, V extends Verify>(
  config: BasicAuthModule<U> | AuthWithValidation<U, V>
): SimpleAuthResolvers | AuthWithVerify {
  const { login, register, verify } = config as AuthWithValidation<U, V>;

  const resolvers: SimpleAuthResolvers = {
    Mutation: {
      register: registerResolver(register),
      login: loginResolver(login),
    },
  };

  // registration resolver if using email verification
  if (includeEmailVerification(register)) {
    // Although the verify resolver is technically a 'mutation' operation,
    // it is a 'Query' operation so that it can be sent in an email link
    (resolvers as AuthWithVerify).Query = { verify: verifyResolver(verify) };
    return resolvers as AuthWithVerify;
  } else {
    return resolvers as SimpleAuthResolvers;
  }
}

export function registerResolver<U extends AuthUser>(
  config: BasicRegistrationController<U>
): GraphQLFieldResolver<any, { input: AuthUser }, any> {
  const registerController = setupRegisterController(config);
  return function register(root, args, ctx, i) {
    return registerController(args.input);
  };
}

/**
 *  A function that handles logging a user in
 *
 * @returns { Object } A User and signed JWT.
 */
export function loginResolver<U extends AuthUser>(
  config: LoginController<U>
): GraphQLFieldResolver<any, { username: string; password: string }, any> {
  const loginController = setupLoginController(config);

  return function login(root, args, ctx, i): Promise<{ token: string }> {
    const username: string = args.username;
    const password: string = args.password;

    return loginController(username, password);
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
