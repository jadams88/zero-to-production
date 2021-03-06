import { createServer } from 'http';
import Koa from 'koa';
import Router from '@koa/router';
import { notImplemented, methodNotAllowed } from '@hapi/boom';
import { globalMiddleware } from '@ztp/server/middleware';
import { apolloServer } from './graphql';
import { applyApiAuthRoutes } from './auth/auth';
import { config } from '../environments';
import { connect } from 'mongoose';
import { restRouter } from './rest';

/**
 * Crates a new API Server
 */
export default class ApiServer {
  constructor(private app: Koa) {}

  /**
   *
   * Sets up all the server configuration and applies the routes
   * @param dbUrl
   */
  async initializeServer(dbUrl?: string) {
    /**
     * Start the db connection, optionally pass in the connection url
     */
    const connection = await connect(
      dbUrl ? dbUrl : config.dbConnectionString,
      config.databaseOptions
    ).catch((err) => {
      console.error(err);
      process.exit(2);
    });

    const app = this.app;
    const router = new Router();

    /**
     * Setup all the required middleware for the app
     */
    app.use(globalMiddleware);

    /**
     * Apply the REST & GraphQL endpoints
     */
    app.use(restRouter.routes());
    app.use(apolloServer.getMiddleware());

    /**
     * apply all authorization routes
     */
    applyApiAuthRoutes(app);

    /**
     * Health check for kubernetes on google cloud
     *
     * Container must return status 200 on a designated health route. In k8's the default route is '/'
     * Must be configured on the deployment object to use this route for checking
     */
    router.get('/healthz', (ctx) => {
      ctx.status = 200;
    });

    /**
     * Apply the routes
     */
    app.use(router.routes());
    app.use(
      router.allowedMethods({
        throw: true,
        notImplemented,
        methodNotAllowed,
      })
    );

    const server = createServer(app.callback());

    /**
     * Add the subscription options, this is a websocket connection
     */
    apolloServer.installSubscriptionHandlers(server);

    /**
     * Listen on the desired port
     */
    server.listen({ port: config.port }, () => {
      console.log(`Server listening on port ${config.port}.`);
    });

    return server;
  }
}
