/* istanbul ignore file */

import { getEnvVariableOrWarn, envToNumber } from '@ztp/server/utils';
import { ProductionServerConfig } from '@ztp/data';
import { AuthEnv } from '@ztp/server/auth';

const audience = getEnvVariableOrWarn('AUDIENCE');
const authServerHost = getEnvVariableOrWarn('AUTH_SERVER_URL');

/**
 * Production environment settings
 */
export const prodConfig: ProductionServerConfig = {
  production: true,
  dbConnectionString: getEnvVariableOrWarn('DB_CONNECTION_STRING'),
  databaseOptions: {
    loggerLevel: 'error',
    autoIndex: true,
  },
};

export const prodAuthConfig: AuthEnv = {
  jwksRoute: true,
  authServerHost,
  accessToken: {
    privateKey: getEnvVariableOrWarn('ACCESS_TOKEN_PRIVATE_KEY'),
    publicKey: getEnvVariableOrWarn('ACCESS_TOKEN_PUBLIC_KEY'),
    expireTime: envToNumber(
      getEnvVariableOrWarn('ACCESS_TOKEN_EXPIRE_TIME'),
      86400
    ),
    issuer: getEnvVariableOrWarn('ISSUER'),
    audience,
  },
  refreshToken: {
    secret: getEnvVariableOrWarn('REFRESH_TOKEN_SECRET'),
    issuer: getEnvVariableOrWarn('ISSUER'),
    audience,
  },
};
