import koa from 'koa';
import { isJWKS } from '../core/auth-utils';
import {
  verifyToken,
  isActiveUser,
  retrievePublicKeyFromJWKS,
} from '../core/authenticate';
import {
  JWKSGuarConfig,
  GuardConfig,
  VerifyTokenConfig,
  VerifyTokenJWKSConfig,
  VerifyUserConfig,
  AuthUser,
} from '../types';

export function getRestGuards<U extends AuthUser>(
  config: GuardConfig<U> | JWKSGuarConfig<U>
) {
  // Check if using JWKS guards or if public key is provided
  return {
    authenticate: isJWKS(config)
      ? authenticateJWKS(config)
      : authenticate(config),
    verifyUser: verifyActiveUser(config),
  };
}

/**
 * npm module koa-bearer-token will get the bearer token from Authorize Header
 * and add it to ctx.request.token. Note this is not decoded
 */

export function authenticate(config: VerifyTokenConfig) {
  return async (ctx: any, next: () => Promise<any>) => {
    /**
     * the encoded token is set at ctx.request.token if the verification
     * passes, replace the encoded token with the decoded token note that the verify function operates synchronously
     */
    ctx.user = verifyToken(ctx.request.token, config.publicKey, config);
    return next();
  };
}

/**
 * Checks if the the token passed is valid
 *
 * Returns the payload decoded if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will throw the error.
 */
export function authenticateJWKS(config: VerifyTokenJWKSConfig) {
  const getPublicKey = retrievePublicKeyFromJWKS(config);

  return async (ctx: any, next: () => Promise<any>) => {
    const publicKey = await getPublicKey(ctx.request.token);

    ctx.user = verifyToken(ctx.request.token, publicKey, config);
    return next();
  };
}

/**
 *  Checks if the user is active
 *
 * This middleware will only be called on a route that is after the verify token
 * middleware has already been called. Hence you can guarantee that ctx.request.user
 * will contain the decoded token, and hence the 'sub' property will be the id
 *
 */
export function verifyActiveUser<U extends AuthUser>({
  User,
}: VerifyUserConfig<U>) {
  const activeUser = isActiveUser(User);
  return async (ctx: koa.ParameterizedContext, next: () => Promise<any>) => {
    // Set the user on the ctx.user property
    ctx.user = await activeUser(ctx.user.sub);
    return next();
  };
}
