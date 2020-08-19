import Koa from 'koa';
import { compose } from 'ramda';
import { Connection } from 'mongoose';
import {
  getUserModel,
  getVerificationTokenModel,
  getRefreshTokenModel,
} from '@ztp/server/core-data';
import {
  generateAuthModuleConfig,
  applyAuthRoutes,
  createAuthSchema,
  createEmailMessage,
  restVerifyUrl,
} from '@ztp/server/auth';
import { authConfig } from '../../environments/environment';
import { configureSendgrid } from '@ztp/server/utils';

// const verifyUrl = restVerifyUrl(authConfig.authServerHost);
// uncomment the below to change to a GraphQL verify url
// const verifyUrl = graphQLVerifyUrl(authConfig.authServerHost);

// const verifyEmail = compose(
// configureSendgrid(config.sendgridApiKey),
// createEmailMessage(verifyUrl)
// );

/**
 * Applies all required auth routes
 */
export function applyLambdaAuthRoutes(app: Koa, conn: Connection) {
  const User = getUserModel(conn);

  const VerificationToken = getVerificationTokenModel(conn);
  const RefreshToken = getRefreshTokenModel(conn);
  const authModuleConfig = generateAuthModuleConfig(
    authConfig,
    User,
    RefreshToken,
    VerificationToken
    // verifyEmail,
  );

  app.use(applyAuthRoutes(authModuleConfig));
}

/**
 * Auth Resolvers
 */
export function authSchema(conn: Connection) {
  const User = getUserModel(conn);

  const VerificationToken = getVerificationTokenModel(conn);
  const RefreshToken = getRefreshTokenModel(conn);

  const authModuleConfig = generateAuthModuleConfig(
    authConfig,
    User,
    RefreshToken,
    VerificationToken
    // verifyEmail,
  );

  return createAuthSchema(authModuleConfig);
}
