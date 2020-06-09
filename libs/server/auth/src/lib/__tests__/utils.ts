import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

export const setupTestServer = () => {
  const app = new Koa();
  app.use(bodyParser());
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      if (e.isBoom) {
        // Is A Boom
        ctx.status = e.output.statusCode;
        ctx.body = e.output.payload;
      }
    }
  });
  return app;
};

export const request = (URL: string, PORT: number) => (path: string) =>
  `${URL}:${PORT}${path}`;

export const newId = () => (Math.random() * 100).toString();
