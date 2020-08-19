/* istanbul ignore file */
import {
  createResolvers,
  createApollo,
  createLoaders,
  createTypeDefs,
  createSchema,
} from '@ztp/server/graphql';
import { todoTypeDef, userTypeDef } from '@ztp/server/core-data';
import { config } from '../environments';
import { userResolvers, todosResolvers, User, Todo } from './api';
import { authDirectives } from './auth/guards';
import { authSchema } from './auth/auth';

const typeDefs = createTypeDefs(userTypeDef, todoTypeDef);
const resolvers = createResolvers(userResolvers, todosResolvers);
const loaders = createLoaders({ users: User, todos: Todo });

export const schema = createSchema({
  typeDefs,
  resolvers,
  directives: authDirectives,
});

export const apolloServer = createApollo({
  schemas: [schema, authSchema],
  production: config.production,
  loaders,
});
