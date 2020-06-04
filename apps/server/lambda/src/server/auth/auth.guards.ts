import { Connection } from 'mongoose';
import { getUserModel } from '@ztp/server/core-data';
import {
  getGraphQLGuards,
  getRestGuards,
  generateAuthGuardConfig,
  createAuthDirectives,
} from '@ztp/server/auth';
import { config, authConfig } from '../../environments/environment';

/**
 * Guards for use in Routes
 */
export const createRestGuards = (conn: Connection) => {
  const User = getUserModel(conn);
  const guardConfig = generateAuthGuardConfig(
    config.production,
    authConfig,
    User
  );
  return getRestGuards(guardConfig);
};

/**
 * Guards to user with GraphQL
 */
export const createGraphQLGuards = (conn: Connection) => {
  const User = getUserModel(conn);
  const guardConfig = generateAuthGuardConfig(
    config.production,
    authConfig,
    User
  );
  return getGraphQLGuards(guardConfig);
};

export const authDirectives = (conn: Connection) => {
  const User = getUserModel(conn);
  const guardConfig = generateAuthGuardConfig(
    config.production,
    authConfig,
    User
  );
  return createAuthDirectives(guardConfig);
};
