import Router from '@koa/router';
import { routeAuthGuard } from './auth/guards';
import { usersRouter, todosRouter } from './api';

export const restRouter = new Router({
  prefix: '/api',
});

// Global check to ensure token is valid
restRouter.use(routeAuthGuard);

// Apply all your routes here
restRouter.use('/users', usersRouter.routes());
restRouter.use('/todos', todosRouter.routes());
