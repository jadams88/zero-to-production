// ZTP_AFTER_CLONE -> Delete this file

import { GraphQLFieldResolver } from 'graphql';
import { IResolvers } from 'apollo-server-koa';
import { IUser } from '@ztp/data';
import { demoSetupRegisterController } from './demo.controllers';
import {
  DemoRegistrationControllerConfig,
  DemoAuthModuleConfig,
} from './demo.interface';
import {
  loginResolver,
  userAvailableResolver,
} from '../graphql/auth.resolvers';

// Verify can not be done via GraphQL because it will be a hyperlink in the
export function getDemoAuthResolvers(config: DemoAuthModuleConfig): IResolvers {
  return {
    Query: {
      userAvailable: userAvailableResolver(config.login),
    },
    Mutation: {
      login: loginResolver(config.login),
      register: registerResolver(config.register),
    },
  };
}

export function registerResolver(
  config: DemoRegistrationControllerConfig
): GraphQLFieldResolver<any, { input: IUser }, any> {
  const registerController = demoSetupRegisterController(config);
  return function register(root, args, ctx, i) {
    return registerController(args.input);
  };
}
