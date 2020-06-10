import { GraphQLFieldResolver } from 'graphql';
import {
  isActiveUser,
  verifyUserRole,
  retrievePublicKeyFromJWKS,
  isJWKS,
  verifyToken,
} from '../core';
import {
  VerifyJWKS,
  VerifyToken,
  AuthUser,
  AuthGuard,
  ActiveUserGuard,
} from '../types';

export type TResolver = GraphQLFieldResolver<any, any, any>;

export function getGraphQLGuards<U extends AuthUser>(config: AuthGuard<U>) {
  const { authenticate, verifyIsActive } = createGraphQLGuards(config);

  return {
    authenticate,
    verifyIsActive: (next: TResolver) => authenticate(verifyIsActive(next)),
    //   authorize: (role: string, next: TResolver) =>
    //     authenticate(verifyUser(authorize(role, next))),
  };
}

export function createGraphQLGuards<U extends AuthUser>({
  authenticate: auth,
  activeUser,
}: AuthGuard<U>) {
  // Check if using JWKS or if public key is provided
  const authenticate = isJWKS(auth)
    ? authenticated(auth)
    : authenticatedJWKS(auth);

  return {
    authenticate,
    verifyIsActive: verifyActiveUser(activeUser),
    // authorize: authorized,
  };
}

/**
 * verify the token signature
 */
export function authenticated(config: VerifyToken) {
  return (next: TResolver): TResolver => async (root, args, ctx, info) => {
    ctx.user = verifyToken(ctx.token, config);
    return await next(root, args, ctx, info);
  };
}

/**
 * Verify the token signature
 */
export function authenticatedJWKS(config: VerifyJWKS) {
  const getPublicKey = retrievePublicKeyFromJWKS(config);

  return (next: TResolver): TResolver => async (root, args, ctx, info) => {
    const publicKey = await getPublicKey(ctx.token);
    ctx.user = verifyToken(ctx.token, { ...config, publicKey });

    return await next(root, args, ctx, info);
  };
}

/**
 * Verify the user is a valid user in the database
 *
 */
export function verifyActiveUser<U extends AuthUser>({
  User,
}: ActiveUserGuard<U>) {
  const activeUser = isActiveUser(User);
  return (next: TResolver): TResolver => async (root, args, ctx, info) => {
    ctx.user = await activeUser(ctx.user.sub);

    return await next(root, args, ctx, info);
  };
}

/**
 * Verify the user role
 */
export function authorized(role: string, next: TResolver): TResolver {
  const verifyRole = verifyUserRole(role);

  return async (root, args, ctx, info) => {
    // This does not return anything, it just throws if unauthorized
    verifyRole(ctx.user.role);
    return await next(root, args, ctx, info);
  };
}
