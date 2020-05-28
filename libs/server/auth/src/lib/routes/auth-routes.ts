import Koa from 'koa';
import Router from '@koa/router';
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
  RegistrationControllerConfig,
  VerifyControllerConfig,
  LoginControllerConfig,
  AuthorizeControllerConfig,
  RefreshControllerConfig,
  RevokeControllerConfig,
  AuthModuleConfig,
} from '../auth.interface';
import { isRefreshConfig } from '../auth-utils';
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
export function applyAuthRoutes(config: AuthModuleConfig) {
  const router = new Router();

  router.post(
    '/authorize/register',
    register({ ...config.register, verifyEmail: config.email })
  );
  router.post('/authorize/login', login(config.login));
  router.get('/authorize/verify', verify(config.verify));
  router.get('/authorize/available', userAvailable(config.login));

  // Only if the config requires everything for refresh tokens as well
  if (isRefreshConfig(config)) {
    router.post('/authorize', authorize(config.authorize));
    router.post('/authorize/refresh', refreshAccessToken(config.refresh));
    router.post('/authorize/token/revoke', revokeRefreshToken(config.revoke));
  }

  // Only crete the JWKS if the config is specified
  if (config.jwks) {
    createJsonWebKeySetRoute(config.jwks, router);
  }

  return router.routes();
}

export function register(config: RegistrationControllerConfig) {
  const registerController = setupRegisterController(config);

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
export function login(config: LoginControllerConfig) {
  // Set up the controller with the config
  const loginController = setupLoginController(config);

  return async (ctx: Koa.ParameterizedContext) => {
    const { username, password } = restUsernameAndPasswordCheck(ctx);

    ctx.body = await loginController(username, password);
  };
}

export function verify(config: VerifyControllerConfig) {
  const verifyController = setupVerifyController(config);
  return async (ctx: Koa.ParameterizedContext) => {
    const email = ctx.query.email;
    const token = ctx.query.token;
    ctx.body = await verifyController(email, token);
  };
}

export function authorize(config: AuthorizeControllerConfig) {
  const authorizeController = setupAuthorizeController(config);
  return async (ctx: Koa.ParameterizedContext) => {
    const { username, password } = restUsernameAndPasswordCheck(ctx);

    ctx.body = await authorizeController(username, password);
  };
}

export function refreshAccessToken(config: RefreshControllerConfig) {
  const refreshAccessTokenCtr = setupRefreshAccessTokenController(config);

  return async (ctx: Koa.ParameterizedContext) => {
    const username = (ctx.request as any).body.username;
    const refreshToken = (ctx.request as any).body.refreshToken;

    if (!username || !refreshToken)
      throw Boom.unauthorized('Username and password must be provided');

    const success = await refreshAccessTokenCtr(username, refreshToken);
    ctx.status = 403;
    ctx.body = success;
  };
}

export function revokeRefreshToken(config: RevokeControllerConfig) {
  const revokeTokenController = setupRevokeRefreshTokenController(config);
  return async (ctx: Koa.ParameterizedContext) => {
    const token: string = (ctx.request as any).body.refreshToken;
    ctx.status = 200;
    ctx.body = await revokeTokenController(token);
  };
}

export function userAvailable(config: LoginControllerConfig) {
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
