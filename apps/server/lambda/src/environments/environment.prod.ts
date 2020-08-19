/* istanbul ignore file */
import { ServerConfig } from '@ztp/data';
import { envToNumber, getEnvVariableOrWarn } from '@ztp/server/utils';
import { AuthEnv } from '@ztp/server/auth';

const audience = getEnvVariableOrWarn('AUDIENCE');
const authServerHost = getEnvVariableOrWarn('AUTH_SERVER_URL');

export const config: ServerConfig = {
  production: true,
  dbConnectionString: getEnvVariableOrWarn('DB_CONNECTION_STRING'),
  databaseOptions: {
    loggerLevel: 'error',
    autoIndex: true,
    useNewUrlParser: true,
    promiseLibrary: Promise,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    bufferCommands: false, // Disable mongoose buffering
    bufferMaxEntries: 0, // and MongoDB driver buffering
  },
  sendgridApiKey: getEnvVariableOrWarn('SENDGRID_API_KEY'),
};

export const authConfig: AuthEnv = {
  jwksRoute: false,
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
    privateKey: getEnvVariableOrWarn('REFRESH_TOKEN_PRIVATE_KEY'),
    issuer: getEnvVariableOrWarn('ISSUER'),
    publicKey: getEnvVariableOrWarn('REFRESH_TOKEN_PUBLIC_KEY'),
    audience,
  },
};
