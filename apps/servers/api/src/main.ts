import http from 'http';
import Koa from 'koa';
import Router from 'koa-router';
import config from './environments';
import { apolloServer } from './server/api/graphql';
import ApiServer from './server/server';

const koa = new Koa();
const router = new Router();

// Set the proxy to true if in production mode
koa.proxy = config.production;

/**
 * A instance of the API Application
 *
 * @param {Koa} app an instance of a koa server
 * @param {Router} router an instance of a koa-router
 */
const app = new ApiServer(koa, router);

/**
 * Create and export a http server
 */
export const server = http.createServer(app.start());

/**
 * Listen on the desired port
 */
server.listen({ port: config.port }, () => {
  console.log(`Server listening on port ${config.port}.`);
});

/**
 * Add the subscription options, this is a websocket connection
 */
apolloServer.installSubscriptionHandlers(server);
