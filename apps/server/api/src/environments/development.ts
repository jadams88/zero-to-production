/* istanbul ignore file */

import { getEnvVariableOrWarn, envToNumber } from '@ztp/server/utils';
import { DevServerConfig } from '@ztp/data';
import { AuthEnv } from '@ztp/server/auth';

const audience = process.env.AUDIENCE || `http://localhost:${process.env.PORT}`;
const authServerHost =
  process.env.AUTH_SERVER_URL || `http://localhost:${process.env.PORT}`;

/**
 * Development environment settings
 */
export const devConfig: DevServerConfig = {
  production: false,
  dbConnectionString: getEnvVariableOrWarn('DB_CONNECTION_STRING'),
  databaseOptions: {
    autoIndex: true,
    loggerLevel: 'warn',
    dbName: process.env.MONGO_DEV_DB || 'development_database',
  },
};

export const devAuthConfig: AuthEnv = {
  jwksRoute: true,
  authServerHost,
  accessToken: {
    privateKey: getEnvVariableOrWarn('ACCESS_TOKEN_PRIVATE_KEY'),
    publicKey: getEnvVariableOrWarn('ACCESS_TOKEN_PUBLIC_KEY'),
    expireTime: envToNumber(process.env.ACCESS_TOKEN_EXPIRE_TIME, 86400),
    issuer: getEnvVariableOrWarn('ISSUER'),
    audience,
  },
  refreshToken: {
    privateKey: getEnvVariableOrWarn('REFRESH_TOKEN_PRIVATE_KEY'),
    publicKey: getEnvVariableOrWarn('REFRESH_TOKEN_PUBLIC_KEY'),
    issuer: getEnvVariableOrWarn('ISSUER'),
    audience,
  },
};
