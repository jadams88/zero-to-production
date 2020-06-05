import { GraphQLFieldResolver } from 'graphql';
import { IResolvers } from 'apollo-server-koa';
import {
  setupLoginController,
  setupRegisterController,
  setupUserAvailableController,
} from '../core/auth.controllers';
import {
  LoginControllerConfig,
  BasicAuthModule,
  AuthUser,
  BasicRegistrationControllerConfig,
} from '../types';

// Verify can not be done via GraphQL because it will be a hyperlink in the
// email they receive
export function getAuthResolvers<U extends AuthUser>(
  config: BasicAuthModule<U>
): IResolvers {
  return {
    Query: {
      userAvailable: userAvailableResolver(config.login),
    },
    Mutation: {
      register: registerResolver(config.register),
      login: loginResolver(config.login),
    },
  };
}

export function registerResolver<U extends AuthUser>(
  config: BasicRegistrationControllerConfig<U>
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
  config: LoginControllerConfig<U>
): GraphQLFieldResolver<any, { username: string; password: string }, any> {
  const loginController = setupLoginController(config);

  return function login(root, args, ctx, i): Promise<{ token: string }> {
    const username: string = args.username;
    const password: string = args.password;

    return loginController(username, password);
  };
}

export function userAvailableResolver<U extends AuthUser>(
  config: LoginControllerConfig<U>
): GraphQLFieldResolver<any, { input: AuthUser }, any> {
  const userAvailableController = setupUserAvailableController(config);
  return (root, args, ctx, i) => {
    return userAvailableController(args.username);
  };
}
