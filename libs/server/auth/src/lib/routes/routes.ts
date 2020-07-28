import type { ParameterizedContext } from 'koa';
import Router, { Middleware } from '@koa/router';
import Boom from '@hapi/boom';
import {
  setupLoginController,
  setupRegisterController,
  setupAuthorizeController,
  setupRefreshAccessTokenController,
  setupRevokeRefreshTokenController,
  setupVerifyController,
  includeEmailVerification,
  includeRefresh,
} from '../core';
import {
  VerifyController,
  LoginController,
  AuthorizeController,
  RefreshController,
  RevokeController,
  RegistrationConfig,
  BasicAuthModule,
  AuthUser,
  Verify,
  Refresh,
  AuthModuleConfig,
  AuthWithValidation,
  BasicAuthAndRefresh,
  CompleteAuth,
} from '../types';
import { createJsonWebKeySetRoute } from './jwks';

export function applyAuthRoutes<U extends AuthUser>(
  config: BasicAuthModule<U>
): Middleware;
export function applyAuthRoutes<U extends AuthUser, V extends Verify>(
  config: AuthWithValidation<U, V>
): Middleware;
export function applyAuthRoutes<U extends AuthUser, R extends Refresh>(
  config: BasicAuthAndRefresh<U, R>
): Middleware;
export function applyAuthRoutes<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(config: CompleteAuth<U, V, R>): Middleware;
export function applyAuthRoutes<
  U extends AuthUser,
  V extends Verify,
  R extends Refresh
>(config: AuthModuleConfig<U, V, R>): Middleware {
  const {
    login,
    register,
    authorize,
    refresh,
    revoke,
  } = config as CompleteAuth<U, V, R>;

  const router = new Router();

  router.post('/login', loginRoute(login));
  router.post('/register', registerRoute(register));

  if (includeEmailVerification(register)) {
    // registration route is using email verification
    router.get('/verify', verifyRoute(register));
  }

  // Only if the config requires everything for refresh tokens as well
  if (includeRefresh(config)) {
    router.post('/authorize', authorizeRoute(authorize));
    router.post('/authorize/refresh', refreshTokenRoute(refresh));
    router.post('/authorize/revoke', revokeRefreshRoute(revoke));
  }

  // Only crete the JWKS if the config is specified
  if (config.jwks) {
    createJsonWebKeySetRoute(config.jwks, router);
  }

  return router.routes();
}

export function registerRoute<U extends AuthUser, V extends Verify>(
  config: RegistrationConfig<U, V>
) {
  const registerController = setupRegisterController<U>(config);

  return async (ctx: ParameterizedContext) => {
    const user = (ctx.request as any).body;
    ctx.body = await registerController(user);
  };
}

/**
 *  A function that handles logging a user in
 *
 * @returns A signed JWT.
 */
export function loginRoute<U extends AuthUser>(config: LoginController<U>) {
  // Set up the controller with the config
  const loginController = setupLoginController(config);

  return async (ctx: ParameterizedContext) => {
    const { username, password } = restUsernameAndPasswordCheck(ctx);

    ctx.body = await loginController(username, password);
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
    const { username, password } = restUsernameAndPasswordCheck(ctx);

    ctx.body = await authorizeController(username, password);
  };
}

export function refreshTokenRoute<R extends Refresh>(
  config: RefreshController<R>
) {
  const refreshAccessTokenCtr = setupRefreshAccessTokenController(config);

  return async (ctx: ParameterizedContext) => {
    const username = (ctx.request as any).body.username;
    const refreshToken = (ctx.request as any).body.refreshToken;

    if (!username || !refreshToken)
      throw Boom.unauthorized('Username and password must be provided');

    const success = await refreshAccessTokenCtr(username, refreshToken);
    ctx.status = 200;
    ctx.body = success;
  };
}

export function revokeRefreshRoute<R extends Refresh>(
  config: RevokeController<R>
) {
  const revokeTokenController = setupRevokeRefreshTokenController(config);
  return async (ctx: ParameterizedContext) => {
    const token: string = (ctx.request as any).body.refreshToken;
    ctx.status = 200;
    ctx.body = await revokeTokenController(token);
  };
}

function restUsernameAndPasswordCheck(ctx: ParameterizedContext) {
  const username: string = (ctx.request as any).body.username;
  const password: string = (ctx.request as any).body.password;

  if (!username || !password)
    throw Boom.unauthorized('Username and password must be provided');
  return {
    username,
    password,
  };
}
