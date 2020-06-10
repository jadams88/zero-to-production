import Koa from 'koa';
import { compose } from 'ramda';
import {
  applyAuthRoutes,
  generateAuthModuleConfig,
  createAuthSchema,
  createEmailMessage,
  graphQLVerifyUrl,
  restVerifyUrl,
} from '@ztp/server/auth';
import { config, authConfig } from '../../environments';
import { User } from '../api/users';
import { VerificationToken, RefreshToken } from './models';
import { configureSendgrid } from '@ztp/server/utils';

// Basic AuthModule (no email verification)
const authModuleConfig = generateAuthModuleConfig(authConfig, User);

// ZTP_AFTER_CLONE -> uncomment the below for a full Auth Module. See the Auth Lib docs
// const verifyUrl = restVerifyUrl(authConfig.authServerHost);
// // uncomment the below to change to a GraphQL verify url
// // const verifyUrl = graphQLVerifyUrl(authConfig.authServerHost);

// const verifyEmail = compose(
//   configureSendgrid(config.sendgridApiKey),
//   createEmailMessage(verifyUrl)
// );

// const authModuleConfig = generateAuthModuleConfig(
//   authConfig,
//   User,
//   VerificationToken,
//   verifyEmail,
//   RefreshToken
// );

/**
 * Applies all required auth routes
 */
export function applyApiAuthRoutes(app: Koa) {
  app.use(applyAuthRoutes(authModuleConfig));
}

/**
 * Auth Schema: all queries and mutation do NOT require to be authorized
 */
export const authSchema = createAuthSchema(authModuleConfig);
