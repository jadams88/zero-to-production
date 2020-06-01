import { createServer } from 'http';
import Koa from 'koa';
import Router from '@koa/router';
import { setupGlobalMiddleware } from '@ztp/server/middleware';
import { apolloServer, applyGraphQLEndpoint } from './graphql';

// ZTP_AFTER_CLONE -> delete the below import
// import { applyApiAuthRoutes } from './auth/demo.auth';
// ZTP_AFTER_CLONE -> uncomment the below import
import { applyApiAuthRoutes } from './auth/auth';

import { config } from '../environments';
import { connect } from 'mongoose';
import { applyRestEndpoints } from './rest';

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
    ).catch(console.error);

    const app = this.app;
    const router = new Router();

    /**
     * Setup all the required middleware for the app
     */
    setupGlobalMiddleware(app);

    /**
     * Apply the REST & GraphQL endpoints
     */
    applyRestEndpoints(app);
    applyGraphQLEndpoint(app);

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
    app.use(router.allowedMethods());

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
