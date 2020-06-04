import {
  getGraphQLGuards,
  getRestGuards,
  generateAuthGuardConfig,
  createAuthDirectives,
} from '@ztp/server/auth';
import { config, authConfig } from '../../environments';
import { User } from '../api/users';

const guardConfig = generateAuthGuardConfig(
  config.production,
  authConfig,
  User
);

/**
 * Guards for use in Routes
 */
export const {
  authenticate: authenticateRest,
  verifyUser: authenticateUserRest,
} = getRestGuards(guardConfig);

/**
 * Guards to user with GraphQL
 */
export const {
  authenticate: authenticateGraphQL,
  verifyUser: authenticateUserGraphQL,
} = getGraphQLGuards(guardConfig);

export const authDirectives = createAuthDirectives(guardConfig);
