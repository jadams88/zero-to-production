import Koa from 'koa';
import Router, { Middleware } from '@koa/router';
import Boom from '@hapi/boom';
import {
  setupLoginController,
  setupRegisterController,
  setupAuthorizeController,
  setupRefreshAccessTokenController,
  setupRevokeRefreshTokenController,
  setupVerifyController,
  setupUserAvailableController,
} from '../auth.controllers';
import {
  VerifyControllerConfig,
  LoginControllerConfig,
  AuthorizeControllerConfig,
  RefreshControllerConfig,
  RevokeControllerConfig,
  RegistrationConfig,
  BasicAuthModule,
  User,
  VerificationToken,
  RefreshToken,
  AuthModuleConfig,
  AuthWithValidation,
  BasicAuthWithRefresh,
  AuthWithRefresh,
} from '../auth.interface';
import { includeEmailVerification, includeRefresh } from '../auth-utils';
import { createJsonWebKeySetRoute } from './jwks';

/**
 * This will register 4 or 7 routes (depends on configuration)
 *
 * '/authorize/login' -> return access token only when user logs in
 * '/authorize/register' -> return access token when user successfully registers
 * '/authorize/available' -> return on object indicating the availability of a given username
 * '/authorize/verify' -> verify the newly registered user (via email)
 *
 * Optional
 * '/authorize' -> returns an access token and refresh token.
 * '/authorize/refresh' -> returns a new access token from a valid refresh token
 * '/authorize/revoke' -> revokes the provided refresh token.
 *
 * Option
 * JWKS Route at '/.well-known/jwks.json' that hosts the public key
 */

// export function applyAuthRoutes<U extends User>(config: BasicAuthModule<U>): Middleware;

// export function applyAuthRoutes(config: AuthModuleConfig) {
// export function applyAuthRoutes(config: AuthModuleConfig) {
export function applyAuthRoutes<U extends User>(
  config: BasicAuthModule<U>
): Middleware;
export function applyAuthRoutes<U extends User, V extends VerificationToken>(
  config: AuthWithValidation<U, V>
): Middleware;
export function applyAuthRoutes<U extends User, R extends RefreshToken>(
  config: BasicAuthWithRefresh<U, R>
): Middleware;
export function applyAuthRoutes<
  U extends User,
  V extends VerificationToken,
  R extends RefreshToken
>(config: AuthWithRefresh<U, V, R>): Middleware;
export function applyAuthRoutes<
  U extends User,
  V extends VerificationToken,
  R extends RefreshToken
>(config: AuthModuleConfig<U, V, R>): Middleware {
  const {
    login,
    register,
    authorize,
    refresh,
    revoke,
  } = config as AuthWithRefresh<U, V, R>;

  const router = new Router();

  router.get('/authorize/available', userAvailableRoute(login));
  router.post('/authorize/login', loginRoute(login));
  router.post('/authorize/register', registerRoute(register));

  if (includeEmailVerification(register)) {
    // registration route is using email verification
    router.get('/authorize/verify', verifyRoute(register));
  }

  // Only if the config requires everything for refresh tokens as well
  if (includeRefresh(config)) {
    router.post('/authorize', authorizeRoute(authorize));
    router.post('/authorize/refresh', refreshTokenRoute(refresh));
    router.post('/authorize/revoke', revokeRefreshTokenRoute(revoke));
  }

  // Only crete the JWKS if the config is specified
  if (config.jwks) {
    createJsonWebKeySetRoute(config.jwks, router);
  }

  return router.routes();
}

export function registerRoute<U extends User, V extends VerificationToken>(
  config: RegistrationConfig<U, V>
) {
  const registerController = setupRegisterController<U>(config);

  return async (ctx: Koa.ParameterizedContext) => {
    const user = (ctx.request as any).body;
    ctx.body = await registerController(user);
  };
}

/**
 *  A function that handles logging a user in
 *
 * @returns A signed JWT.
 */
export function loginRoute<U extends User>(config: LoginControllerConfig<U>) {
  // Set up the controller with the config
  const loginController = setupLoginController(config);

  return async (ctx: Koa.ParameterizedContext) => {
    const { username, password } = restUsernameAndPasswordCheck(ctx);

    ctx.body = await loginController(username, password);
  };
}

export function verifyRoute<U extends User, V extends VerificationToken>(
  config: VerifyControllerConfig<U, V>
) {
  const verifyController = setupVerifyController(config);
  return async (ctx: Koa.ParameterizedContext) => {
    const email = ctx.query.email;
    const token = ctx.query.token;
    ctx.body = await verifyController(email, token);
  };
}

export function authorizeRoute<U extends User, R extends RefreshToken>(
  config: AuthorizeControllerConfig<U, R>
) {
  const authorizeController = setupAuthorizeController(config);
  return async (ctx: Koa.ParameterizedContext) => {
    const { username, password } = restUsernameAndPasswordCheck(ctx);

    ctx.body = await authorizeController(username, password);
  };
}

export function refreshTokenRoute<R extends RefreshToken>(
  config: RefreshControllerConfig<R>
) {
  const refreshAccessTokenCtr = setupRefreshAccessTokenController(config);

  return async (ctx: Koa.ParameterizedContext) => {
    const username = (ctx.request as any).body.username;
    const refreshToken = (ctx.request as any).body.refreshToken;

    if (!username || !refreshToken)
      throw Boom.unauthorized('Username and password must be provided');

    const success = await refreshAccessTokenCtr(username, refreshToken);
    ctx.status = 200;
    ctx.body = success;
  };
}

export function revokeRefreshTokenRoute<R extends RefreshToken>(
  config: RevokeControllerConfig<R>
) {
  const revokeTokenController = setupRevokeRefreshTokenController(config);
  return async (ctx: Koa.ParameterizedContext) => {
    const token: string = (ctx.request as any).body.refreshToken;
    ctx.status = 200;
    ctx.body = await revokeTokenController(token);
  };
}

export function userAvailableRoute<U extends User>(
  config: LoginControllerConfig<U>
) {
  const userAvailableController = setupUserAvailableController(config);
  return async (ctx: Koa.ParameterizedContext) => {
    const username: string | undefined = ctx.query.username;
    ctx.status = 200;
    ctx.body = await userAvailableController(username);
  };
}

function restUsernameAndPasswordCheck(ctx: Koa.ParameterizedContext) {
  const username: string = (ctx.request as any).body.username;
  const password: string = (ctx.request as any).body.password;

  if (!username || !password)
    throw Boom.unauthorized('Username and password must be provided');
  return {
    username,
    password,
  };
}
