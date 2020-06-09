import { ParameterizedContext } from 'koa';
import {
  isJWKS,
  isActiveUser,
  retrievePublicKeyFromJWKS,
  verifyToken,
} from '../core';
import {
  AuthGuard,
  VerifyToken,
  VerifyJWKS,
  ActiveUserGuard,
  AuthUser,
} from '../types';

export type RouterGuard = (
  ctx: ParameterizedContext,
  next: () => Promise<any>
) => Promise<any>;

export interface RouterGuards {
  authenticate: RouterGuard;
  verifyUser: RouterGuard;
}

export function getRestGuards<U extends AuthUser>({
  authenticate: auth,
  activeUser,
}: AuthGuard<U>): RouterGuards {
  // Check if using JWKS guards or if public key is provided
  return {
    authenticate: isJWKS(auth) ? authenticate(auth) : authenticateJWKS(auth),
    verifyUser: verifyActiveUser(activeUser),
  };
}

/**
 * npm module koa-bearer-token will get the bearer token from Authorize Header
 * and add it to ctx.request.token. Note this is not decoded
 */

export function authenticate(config: VerifyToken) {
  return async (ctx: any, next: () => Promise<any>) => {
    /**
     * the encoded token is set at ctx.request.token if the verification
     * passes, replace the encoded token with the decoded token note that the verify function operates synchronously
     */
    ctx.user = verifyToken(ctx.request.token, config);
    return next();
  };
}

/**
 * Checks if the the token passed is valid
 *
 * Returns the payload decoded if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will throw the error.
 */
export function authenticateJWKS(config: VerifyJWKS) {
  const getPublicKey = retrievePublicKeyFromJWKS(config);

  return async (ctx: ParameterizedContext, next: () => Promise<any>) => {
    const publicKey = await getPublicKey((ctx.request as any).token);

    ctx.user = verifyToken((ctx.request as any).token, {
      ...config,
      publicKey,
    });
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
}: ActiveUserGuard<U>) {
  const activeUser = isActiveUser(User);
  return async (ctx: ParameterizedContext, next: () => Promise<any>) => {
    // Set the user on the ctx.user property
    ctx.user = await activeUser(ctx.user.sub);
    return next();
  };
}
