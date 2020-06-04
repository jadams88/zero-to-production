/* istanbul ignore file */
import Koa from 'koa';
import { Connection } from 'mongoose';
import {
  createResolvers,
  createApollo,
  createTypeDefs,
  createSchema,
} from '@ztp/server/graphql';
import { todoTypeDef, userTypeDef } from '@ztp/server/core-data';
import { config } from '../environments/environment';
import { authDirectives } from './auth/auth.guards';
import { usersResolvers, todosResolvers } from './api';
import { createAuthSchemaFromConnection } from './auth/auth';

// A function that applies the middleware to the app.
export function applyGraphQLEndpoint(app: Koa, conn: Connection) {
  const typeDefs = createTypeDefs(userTypeDef, todoTypeDef);
  const resolvers = createResolvers(usersResolvers(conn), todosResolvers(conn));

  const schema = createSchema({
    typeDefs,
    resolvers,
    directives: authDirectives(conn),
  });

  const authSchema = createAuthSchemaFromConnection(conn);

  const apolloServer = createApollo({
    schemas: [schema, authSchema],
    production: config.production,
  });

  apolloServer.applyMiddleware({ app });
}
