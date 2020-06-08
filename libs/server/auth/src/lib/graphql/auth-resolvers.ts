import { GraphQLFieldResolver } from 'graphql';
import { IResolvers } from 'apollo-server-koa';
import {
  setupLoginController,
  setupRegisterController,
  setupUserAvailableController,
  setupVerifyController,
} from '../core/auth.controllers';
import {
  LoginController,
  BasicAuthModule,
  AuthUser,
  BasicRegistrationController,
  VerifyController,
  Verify,
  AuthWithValidation,
} from '../types';
import { includeEmailVerification } from '../core/auth-utils';

// graphql?query=query{verify(email:"one",token:"two"){message}}

// Verify can not be done via GraphQL because it will be a hyperlink in the
// email they receive
export function getAuthResolvers<U extends AuthUser, V extends Verify>(
  config: BasicAuthModule<U> | AuthWithValidation<U, V>
): IResolvers {
  const { login, register, verify } = config as AuthWithValidation<U, V>;

  const resolvers: IResolvers = {
    Query: {
      userAvailable: userAvailableResolver(login),
    },
    Mutation: {
      register: registerResolver(register),
      login: loginResolver(login),
    },
  };

  if (includeEmailVerification(register)) {
    // registration route is using email verification

    // const ve = verifyResolver(verify);
    // const a = {
    //   ...resolvers,
    //   ...{ Query: { verify: ve } },
    // };

    // console.log(resolvers);
    const r = { ...resolvers };
    (r.Query as any).verify = verifyResolver(verify);
    console.log(r);
    return r;
    // resolvers.Query.verify = verify;

    // return resolvers;
  } else {
    return resolvers;
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

export function userAvailableResolver<U extends AuthUser>(
  config: LoginController<U>
): GraphQLFieldResolver<any, { input: AuthUser }, any> {
  const userAvailableController = setupUserAvailableController(config);
  return (root, args, ctx, i) => {
    return userAvailableController(args.username);
  };
}

export function verifyResolver<U extends AuthUser, V extends Verify>(
  config: VerifyController<U, V>
): GraphQLFieldResolver<any, { email: string; token: string }, any> {
  const verifyController = setupVerifyController(config);

  return function verify(root, args, ctx, i): Promise<{ message: string }> {
    console.log('HERERE');
    const email: string = args.email;
    const token: string = args.token;

    return verifyController(email, token);
  };
}
