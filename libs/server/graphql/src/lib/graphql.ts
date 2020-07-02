/* istanbul ignore file */
import type { Context } from 'koa';
import { GraphQLSchema } from 'graphql';
import {
  ApolloServer,
  makeExecutableSchema,
  IResolvers,
  ITypeDefinitions,
  SchemaDirectiveVisitor,
  mergeSchemas,
} from 'apollo-server-koa';
import { ILoaders } from './data-loader';
import { FormatDateDirective } from './directives';

export function createSchema({
  typeDefs,
  resolvers,
  directives,
}: {
  typeDefs: ITypeDefinitions;
  resolvers: IResolvers[];
  directives?: {
    [name: string]: typeof SchemaDirectiveVisitor;
  };
}): GraphQLSchema {
  const defaultDirectives = {
    // log: LogDirective,
    formatDate: FormatDateDirective,
  };

  return makeExecutableSchema({
    typeDefs,
    resolvers,
    allowUndefinedInResolve: false,
    schemaDirectives: directives
      ? { ...defaultDirectives, ...directives }
      : defaultDirectives,
  });
}

export function createApollo({
  schemas,
  production,
  loaders,
}: {
  schemas: GraphQLSchema[];
  production: boolean;
  loaders?: () => ILoaders;
}) {
  const schema = mergeSchemas({ schemas });
  return new ApolloServer({
    formatError: (e) => {
      console.log(e);
      return e;
    },
    schema,
    // https://www.apollographql.com/docs/apollo-server/data/subscriptions/
    context: async ({ ctx, connection }: { ctx: Context; connection: any }) => {
      // if the connection exists, it is a subscription
      if (connection) {
        return {
          state: {},
          // Add any necessary data loaders here if wanted
          loaders: loaders ? loaders() : undefined,
        };
      }
      // if the ctx exists, it is a req/res
      if (ctx) {
        return {
          // create an empty state object to store temporary data in the resolvers
          state: {},
          // Add any necessary data loaders here if wanted
          loaders: loaders ? loaders() : undefined,
          // Add the JWT as the token property
          token: (ctx.request as any).token,
        };
      }
    },
    playground: !production,
    tracing: !production,
    debug: !production,
    uploads: false,
  });
}
