/* istanbul ignore file */
import { ServerConfig } from '@ztp/data';
import { envToNumber, getEnvVariableOrWarn } from '@ztp/server/utils';
import { ServerAuthConfig } from '@ztp/server/auth';

const audience = process.env.AUDIENCE || `http://localhost:${process.env.PORT}`;
const authServerUrl =
  process.env.AUTH_SERVER_URL || `http://localhost:${process.env.PORT}`;

export const config: ServerConfig = {
  production: false,
  dbConnectionString: getEnvVariableOrWarn('DB_CONNECTION_STRING'),
  databaseOptions: {
    dbName: getEnvVariableOrWarn('MONGO_DEV_DB'),
    autoIndex: true,
    loggerLevel: 'warn',
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

export const authConfig: ServerAuthConfig = {
  jwksRoute: false,
  authServerUrl,
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
