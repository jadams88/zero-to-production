import Koa from 'koa';
// @ts-ignore
import helmet from 'koa-helmet';
// @ts-ignore
import compress from 'koa-compress';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { bearerToken } from './bearer-token';
import { errorHandler } from './err-handler';

// Configure middleware to parse income requests
export function setupGlobalMiddleware(app: Koa) {
  app.use(helmet());
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
