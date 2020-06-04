import Koa from 'koa';
import { compose } from 'ramda';
import { Connection } from 'mongoose';
import {
  getUserModel,
  getVerificationTokenModel,
  getRefreshTokenModel,
} from '@ztp/server/core-data';
import {
  getAuthResolvers,
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

  // Basic AuthModule (no email verification)
  const authModuleConfig = generateAuthModuleConfig(authConfig, User);

  // ZTP_AFTER_CLONE -> uncomment the below import
  // const VerificationToken = getVerificationTokenModel(conn);
  // const RefreshToken = getRefreshTokenModel(conn);
  // const authModuleConfig = generateAuthModuleConfig(
  //   authConfig,
  //   User,
  //   VerificationToken,
  //   verifyEmail,
  //   RefreshToken
  // );

  app.use(applyAuthRoutes(authModuleConfig));
}

/**
 * Auth Resolvers
 */
export function authResolvers(conn: Connection) {
  const User = getUserModel(conn);

  // Basic AuthModule (no email verification)
  const authModuleConfig = generateAuthModuleConfig(authConfig, User);

  // ZTP_AFTER_CLONE -> uncomment the below import
  const VerificationToken = getVerificationTokenModel(conn);
  // const RefreshToken = getRefreshTokenModel(conn);
  // const authModuleConfig = generateAuthModuleConfig(
  //   authConfig,
  //   User,
  //   VerificationToken,
  //   verifyEmail,
  //   RefreshToken
  // );

  return getAuthResolvers(authModuleConfig);
}

export function createAuthSchemaFromConnection(conn: Connection) {
  const resolvers = authResolvers(conn);
  return createAuthSchema(resolvers);
}
