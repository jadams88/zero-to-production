import Koa from 'koa';
import { compose } from 'ramda';
import {
  applyAuthRoutes,
  generateAuthModuleConfig,
  createAuthSchema,
  getAuthResolvers,
  createEmailMessage,
} from '@ztp/server/auth';
import { config, authConfig } from '../../environments';
import { User } from '../api/users';
import { VerificationToken, RefreshToken } from './models';
import { configureSendgrid } from '@ztp/server/utils';

// Basic AuthModule (no email verification)
const authModuleConfig = generateAuthModuleConfig(authConfig, User);

// ZTP_AFTER_CLONE -> uncomment the below import
// const emailClient = configureSendgrid(config.sendgridApiKey);
// const createMessage = createEmailMessage(authConfig.authServerUrl);
// const verifyEmail = compose(emailClient, createMessage);

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

const resolvers = getAuthResolvers(authModuleConfig);

/**
 * Auth Schema: all queries and mutation do NOT require to be authorized
 */
export const authSchema = createAuthSchema(resolvers);
