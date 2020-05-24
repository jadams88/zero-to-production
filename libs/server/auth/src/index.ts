export * from './lib/models';
export {
  isPasswordAllowed,
  generateAuthGuardConfig,
  generateAuthModuleConfig,
  createPublicPemFromPrivate,
} from './lib/auth-utils';
export {
  AuthModuleConfig,
  IRefreshTokenModel,
  IRefreshTokenDocument,
  IVerificationToken,
  IVerificationTokenDocument,
  IVerificationTokenModel,
  ServerAuthConfig,
  JWKSGuarConfig,
  GuardConfig,
  JWKSRouteConfig,
} from './lib/auth.interface';
export { getRestGuards } from './lib/routes/route.guards';
export { applyAuthRoutes } from './lib/routes/auth.routes';
export { configureSendGridEmail } from './lib/send-email';

export * from './lib/graphql';

/**
 * ZTP_AFTER_CLONE -> Delete from this line onwards after cloning the repo
 *
 * For further details, see
 * https://github.com/jonathonadams/zero-to-production/tree/master/libs/server/auth/README.md
 */
export * from './lib/demo/index';
