import Koa from 'koa';
import { Connection } from 'mongoose';
import { getUserModel } from '@ztp/server/core-data';
import {
  getAuthResolvers,
  getVerificationTokenModel,
  getRefreshTokenModel,
  generateAuthModuleConfig,
  applyAuthRoutes,
  createAuthSchema,
  configureSendGridEmail,
} from '@ztp/server/auth';
import { authConfig } from '../../environments/environment';

const verifyEmail = configureSendGridEmail(authConfig.email);

/**
 * Applies all required auth routes
 */
export function applyLambdaAuthRoutes(app: Koa, conn: Connection) {
  const User = getUserModel(conn);
  const VerificationToken = getVerificationTokenModel(conn);
  const RefreshToken = getRefreshTokenModel(conn);
  const config = generateAuthModuleConfig(
    User,
    VerificationToken,
    RefreshToken,
    authConfig,
    verifyEmail
  );

  app.use(applyAuthRoutes(config));
}

/**
 * Auth Resolvers
 */
export function authResolvers(conn: Connection) {
  const User = getUserModel(conn);
  const VerificationToken = getVerificationTokenModel(conn);
  const RefreshToken = getRefreshTokenModel(conn);
  const config = generateAuthModuleConfig(
    User,
    VerificationToken,
    RefreshToken,
    authConfig,
    verifyEmail
  );

  return getAuthResolvers(config);
}

export function createAuthSchemaFromConnection(conn: Connection) {
  const resolvers = authResolvers(conn);
  return createAuthSchema(resolvers);
}
