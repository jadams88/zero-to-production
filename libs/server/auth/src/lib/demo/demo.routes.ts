// ZTP_AFTER_CLONE -> Delete this file

import Koa from 'koa';
import Router from '@koa/router';
import { demoSetupRegisterController } from './demo.controllers';
import {
  DemoRegistrationControllerConfig,
  DemoAuthModuleConfig,
} from './demo.interface';
import { createJsonWebKeySetRoute } from '../routes/jwks';
import { login, userAvailable } from '../routes/auth.routes';

/**
 * This will register 3 routes for authentication
 *
 * '/authorize/login' -> return access token when user logs in
 * '/authorize/register' -> return access token when user successfully registers
 * '/authorize/available' -> return on object indicating the availability of a given username
 */

export function applyDemoAuthRoutes(config: DemoAuthModuleConfig) {
  const router = new Router();
  router.post('/authorize/login', login(config.login));
  router.post('/authorize/register', register(config.register));
  router.get('/authorize/available', userAvailable(config.login));

  // Only crete the JWKS if the config is specified
  if (config.jwks) {
    createJsonWebKeySetRoute(config.jwks, router);
  }

  return router.routes();
}

export function register(config: DemoRegistrationControllerConfig) {
  const registerController = demoSetupRegisterController(config);

  return async (ctx: Koa.ParameterizedContext) => {
    const user = (ctx.request as any).body;
    ctx.body = await registerController(user);
  };
}
