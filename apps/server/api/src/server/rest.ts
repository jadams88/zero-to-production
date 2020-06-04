import Koa from 'koa';
import Router from '@koa/router';
import { authenticateRest } from './auth/auth-guards';
import { usersRouter, todosRouter } from './api';

export function applyRestEndpoints(app: Koa) {
  const router = new Router({
    prefix: '/api',
  });

  // Global check to ensure token is valid
  router.use(authenticateRest);

  // Apply all your routes here
  router.use('/users', usersRouter.routes());
  router.use('/todos', todosRouter.routes());

  app.use(router.routes());
}
