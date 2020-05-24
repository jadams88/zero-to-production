import { GraphQLFieldResolver } from 'graphql';
import { IResolvers } from 'apollo-server-koa';
import { IUser } from '@ztp/data';
import {
  setupLoginController,
  setupRegisterController,
  setupUsernameAvailableController,
} from '../auth.controllers';
import {
  LoginControllerConfig,
  RegistrationControllerConfig,
  LoginAndRegisterConfig,
} from '../auth.interface';

// Verify can not be done via GraphQL because it will be a hyperlink in the
// email they receive
export function getAuthResolvers(config: LoginAndRegisterConfig): IResolvers {
  const registerConfig = { ...config.register, verifyEmail: config.email };
  return {
    Query: {
      usernameAvailable: usernameAvailableResolver(config.login),
    },
    Mutation: {
      login: loginResolver(config.login),
      register: registerResolver(registerConfig),
    },
  };
}

/**
 *  A function that handles logging a user in
 *
 * @returns { Object } A User and signed JWT.
 */
export function loginResolver(
  config: LoginControllerConfig
): GraphQLFieldResolver<any, { username: string; password: string }, any> {
  const loginController = setupLoginController(config);

  return function login(root, args, ctx, i): Promise<{ token: string }> {
    const username: string = args.username;
    const password: string = args.password;

    return loginController(username, password);
  };
}

export function registerResolver(
  config: RegistrationControllerConfig
): GraphQLFieldResolver<any, { input: IUser }, any> {
  const registerController = setupRegisterController(config);
  return function register(root, args, ctx, i) {
    return registerController(args.input);
  };
}

export function usernameAvailableResolver(
  config: LoginControllerConfig
): GraphQLFieldResolver<any, { input: IUser }, any> {
  const usernameAvailableController = setupUsernameAvailableController(config);
  return (root, args, ctx, i) => {
    return usernameAvailableController(args.username);
  };
}
