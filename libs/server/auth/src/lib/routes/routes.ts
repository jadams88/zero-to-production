import type { ParameterizedContext } from 'koa';
import Router, { Middleware } from '@koa/router';
import Boom from '@hapi/boom';
import {
  setupRegisterController,
  setupAuthorizeController,
  setupRefreshAccessTokenController,
  setupRevokeRefreshTokenController,
  setupVerifyController,
} from '../core';
import {
  VerifyController,
  AuthorizeController,
  RefreshController,
  RevokeController,
  AuthUser,
  Verify,
  Refresh,
  AuthModuleConfig,
  RegisterController,
} from '../types';
import { createJsonWebKeySetRoute } from './jwks';

export function applyAuthRoutes<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(config: AuthModuleConfig<U, R, V>): Middleware {
  const { register, authorize, refresh, revoke } = config;

  const router = new Router();

  router.post('/register', registerRoute(register));
  router.post('/authorize', authorizeRoute(authorize));
  router.post('/authorize/refresh', refreshTokenRoute(refresh));
  router.post('/authorize/revoke', revokeRefreshRoute(revoke));
  router.get('/verify', verifyRoute(register));

  // Only crete the JWKS if the config is specified
  if (config.jwks) {
    createJsonWebKeySetRoute(config.jwks, router);
  }

  return router.routes();
}

export function registerRoute<U extends AuthUser, V extends Verify>(
  config: RegisterController<U, V>
) {
  const registerController = setupRegisterController<U, V>(config);

  return async (ctx: ParameterizedContext) => {
    const user = (ctx.request as any).body;
    ctx.body = await registerController(user);
  };
}

export function verifyRoute<U extends AuthUser, V extends Verify>(
  config: VerifyController<U, V>
) {
  const verifyController = setupVerifyController(config);
  return async (ctx: ParameterizedContext) => {
    const email = ctx.query.email;
    const token = ctx.query.token;
    ctx.body = await verifyController(email, token);
  };
}

export function authorizeRoute<U extends AuthUser, R extends Refresh>(
  config: AuthorizeController<U, R>
) {
  const authorizeController = setupAuthorizeController(config);

  return async (ctx: ParameterizedContext) => {
    const username: string = (ctx.request as any).body.username;
    const password: string = (ctx.request as any).body.password;

    ctx.body = await authorizeController(username, password, ctx.cookies);
  };
}

export function refreshTokenRoute<R extends Refresh>(
  config: RefreshController<R>
) {
  const refreshAccessTokenCtr = setupRefreshAccessTokenController(config);

  return async (ctx: ParameterizedContext) => {
    // The refresh token is either supplied on the body, or the header
    const refreshToken =
      (ctx.request as any).body.refreshToken ||
      ctx.cookies.get('refresh_token');

    ctx.body = await refreshAccessTokenCtr(refreshToken, ctx.cookies);
  };
}

export function revokeRefreshRoute<R extends Refresh>(
  config: RevokeController<R>
) {
  const revokeTokenController = setupRevokeRefreshTokenController(config);
  return async (ctx: ParameterizedContext) => {
    const token =
      (ctx.request as any).body.refreshToken ||
      ctx.cookies.get('refresh_token');

    ctx.body = await revokeTokenController(token, ctx.cookies);
  };
}
