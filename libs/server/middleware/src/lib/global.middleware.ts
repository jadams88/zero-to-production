import Koa from 'koa';
// @ts-ignore
// import helmet from 'koa-helmet';
// @ts-ignore
import compress from 'koa-compress';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { helmet } from './helmet';
import { bearerToken } from './bearer-token';
import { errorHandler } from './err-handler';

// Configure middleware to parse income requests
export function setupGlobalMiddleware(app: Koa) {
  /**
   * This is a workaround because Koa does not allow you to set the cookie secure flag over http (behind a load balancer)
   */
  app.use((ctx, next) => {
    ctx.cookies.secure = true;
    return next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      expectCt: { enforce: true },
      hsts: {
        maxAge: 63072000, // two years
        preload: true,
      },
      xssFilter: false,
      noSniff: false,
    })
  );
  app.use(compress());
  app.use(bodyParser());
  app.use(
    cors({
      credentials: true,
    })
  );
  app.use(bearerToken());

  // Custom error handling
  app.use(errorHandler);
}
