import Koa from 'koa';
import {
  applyAuthRoutes,
  generateAuthModuleConfig,
  createAuthSchema,
  getAuthResolvers,
  configureSendGridEmail,
} from '@ztp/server/auth';
import { authConfig } from '../../environments';
import { User } from '../api/users';
import { VerificationToken, RefreshToken } from './models';

const verifyEmail = configureSendGridEmail(authConfig.email);

const authModuleConfig = generateAuthModuleConfig(
  User,
  VerificationToken,
  RefreshToken,
  authConfig,
  verifyEmail
);

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
