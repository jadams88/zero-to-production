import Koa from 'koa';
import { Connection } from 'mongoose';
import serverless, { Handler } from 'serverless-http';
import { errorHandler, setupGlobalMiddleware } from '@ztp/server/middleware';
import LambdaServer from './server';

let handler: Handler;

export async function createHandler(conn: Connection) {
  // If a cached handler exists, uses that one
  if (handler) {
    return handler;
  }
  const koa = new Koa();

  setupGlobalMiddleware(koa);

  koa.use(errorHandler);

  const app = new LambdaServer(koa);

  handler = serverless(app.initializeServer(conn), { basePath: '' });
  return handler;
}
