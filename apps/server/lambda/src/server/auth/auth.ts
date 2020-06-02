import Koa from 'koa';
import { compose } from 'ramda';
import { Connection } from 'mongoose';
import { getUserModel } from '@ztp/server/core-data';
import {
  getAuthResolvers,
  getVerificationTokenModel,
  getRefreshTokenModel,
  generateAuthModuleConfig,
  applyAuthRoutes,
  createAuthSchema,
  createEmailMessage,
} from '@ztp/server/auth';
import { config, authConfig } from '../../environments/environment';
import { configureSendgrid } from '@ztp/server/utils';

const emailClient = configureSendgrid(config.sendgridApiKey);
const createMessage = createEmailMessage(authConfig.authServerUrl);
const verifyEmail = compose(emailClient, createMessage);

/**
 * Applies all required auth routes
 */
export function applyLambdaAuthRoutes(app: Koa, conn: Connection) {
  const User = getUserModel(conn);
  const VerificationToken = getVerificationTokenModel(conn);
  const RefreshToken = getRefreshTokenModel(conn);
  const moduleConfig = generateAuthModuleConfig(
    User,
    VerificationToken,
    RefreshToken,
    authConfig,
    verifyEmail
  );

  app.use(applyAuthRoutes(moduleConfig));
}

/**
 * Auth Resolvers
 */
export function authResolvers(conn: Connection) {
  const User = getUserModel(conn);
  const VerificationToken = getVerificationTokenModel(conn);
  const RefreshToken = getRefreshTokenModel(conn);
  const moduleConfig = generateAuthModuleConfig(
    User,
    VerificationToken,
    RefreshToken,
    authConfig,
    verifyEmail
  );

  return getAuthResolvers(moduleConfig);
}

export function createAuthSchemaFromConnection(conn: Connection) {
  const resolvers = authResolvers(conn);
  return createAuthSchema(resolvers);
}
