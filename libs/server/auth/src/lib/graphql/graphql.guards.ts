import {
  GuardConfig,
  JWKSGuarConfig,
  VerifyUserConfig,
  VerifyTokenJWKSConfig,
  VerifyTokenConfig,
  TResolver,
} from '../auth.interface';
import { isJWKS } from '../auth-utils';
import {
  verifyToken,
  isActiveUser,
  verifyUserRole,
  retrievePublicKeyFromJWKS,
} from '../authenticate';

export function getGraphQLGuards(config: GuardConfig | JWKSGuarConfig) {
  const { authenticate, verifyUser, authorize } = createGraphQLGuards(config);

  return {
    authenticate,
    verifyUser(next: TResolver) {
      return authenticate(verifyUser(next));
    },
    authorize(role: string, next: TResolver) {
      return authenticate(verifyUser(authorize(role, next)));
    },
  };
}

export function createGraphQLGuards(config: GuardConfig | JWKSGuarConfig) {
  // Check if using JWKS or if public key is provided
  const authenticate = isJWKS(config)
    ? authenticatedJWKS(config)
    : authenticated(config);

  return {
    authenticate,
    verifyUser: verifyActiveUser(config),
    authorize: authorized,
  };
}

/**
 * verify the token signature
 */
export function authenticated(config: VerifyTokenConfig) {
  return (next: TResolver): TResolver => async (root, args, ctx, info) => {
    ctx.user = verifyToken(ctx.token, config.publicKey, config);
    return await next(root, args, ctx, info);
  };
}

/**
 * Verify the token signature
 */
export function authenticatedJWKS(config: VerifyTokenJWKSConfig) {
  const getPublicKey = retrievePublicKeyFromJWKS(config);

  return (next: TResolver): TResolver => async (root, args, ctx, info) => {
    const publicKey = await getPublicKey(ctx.token);
    ctx.user = verifyToken(ctx.token, publicKey, config);

    return await next(root, args, ctx, info);
  };
}

/**
 * Verify the user is a valid user in the database
 *
 */
export function verifyActiveUser({ User }: VerifyUserConfig) {
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
