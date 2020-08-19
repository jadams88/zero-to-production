import Koa from 'koa';
import Router from '@koa/router';
import { notImplemented, methodNotAllowed } from '@hapi/boom';
import { Connection } from 'mongoose';
import { applyRestEndpoints } from './rest';
import { applyGraphQLEndpoint } from './graphql';
import { applyLambdaAuthRoutes } from './auth/auth';

/**
 * Crates a new API Server
 */
export default class LambdaServer {
  constructor(private app: Koa) {}

  /**
   * Sets up all the server configuration and applies the routes
   * @param conn
   */
  initializeServer(conn: Connection) {
    const app = this.app;
    const router = new Router();

    /**
     * apply all authorization routes
     */
    applyLambdaAuthRoutes(app, conn);

    applyGraphQLEndpoint(app, conn);
    applyRestEndpoints(app, conn);

    /**
     * This is a workaround because Koa does not allow you to set the cookie secure flag over http (behind a load balancer)
     */
    app.use((ctx, next) => {
      ctx.cookies.secure = true;
      return next();
    });

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

    return app;
  }
}
