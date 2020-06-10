import Koa from 'koa';
import Router from '@koa/router';
import { Connection } from 'mongoose';
import { createRestGuards } from './auth/guards';
import { usersRouter, todosRouter } from './api';

export function applyRestEndpoints(app: Koa, conn: Connection) {
  const { authenticate } = createRestGuards(conn);

  const router = new Router({
    prefix: '/api',
  });

  // Global check to ensure token is valid
  router.use(authenticate);

  // Apply all your routes here
  router.use('/users', usersRouter(conn).routes());
  router.use('/todos', todosRouter(conn).routes());

  app.use(router.routes());
}
