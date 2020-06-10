import {
  getGraphQLGuards,
  getRestGuards,
  generateAuthGuardConfig,
  createAuthDirectives,
} from '@ztp/server/auth';
import { authConfig } from '../../environments';
import { User } from '../api/users';

const guardConfig = generateAuthGuardConfig(authConfig, User);

/**
 * Guards for use in Routes
 */
export const {
  authenticate: routeAuthGuard,
  verifyIsActive: routeIsActiveGuard,
} = getRestGuards(guardConfig);

/**
 * Guards to user with GraphQL Resolvers
 */
export const {
  authenticate: resolverAuthGuard,
  verifyIsActive: resolverIsActiveGuard,
} = getGraphQLGuards(guardConfig);

export const authDirectives = createAuthDirectives(guardConfig);
