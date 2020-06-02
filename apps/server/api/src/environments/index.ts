/* istanbul ignore file */

import {
  GlobalServerConfig,
  EnvironnementConfig,
  ServerConfig,
} from '@ztp/data';
import { envToNumber, getEnvVariableOrWarn } from '@ztp/server/utils';
import { ServerAuthConfig } from '@ztp/server/auth';
import { devConfig, devAuthConfig } from './development.js';
import { prodConfig, prodAuthConfig } from './production.js';
import { testConfig, testAuthConfig } from './test.js';

/**
 * Config values common across all environments environments
 *
 * Application configuration belongs in this file and associated
 * environment files. The appropriate environment file is merged based on the
 * NODE_ENV variable: development, production, and test.
 *
 */
const globalConfig: GlobalServerConfig = {
  /**
   * The port the server will listen on
   */
  port: envToNumber(process.env.PORT, 3000),

  /**
   * Global database options for Mongoose
   */
  databaseOptions: {
    autoIndex: false, // default for production, overridden in development
    useNewUrlParser: true,
    promiseLibrary: Promise,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  sendgridApiKey: getEnvVariableOrWarn('SENDGRID_API_KEY'),
};

/**
 * Assign values based on current execution environment
 *
 * TODO -> Top level await when ts is updated to 3.8
 */
let environmentSettings: EnvironnementConfig;
export let authConfig: ServerAuthConfig;
switch (process.env.NODE_ENV) {
  case 'prod':
  case 'production':
    environmentSettings = prodConfig;
    authConfig = prodAuthConfig;
    break;
  case 'test':
  case 'testing':
    environmentSettings = testConfig;
    authConfig = testAuthConfig;
    break;
  case 'development':
  case 'dev':
    environmentSettings = devConfig;
    authConfig = devAuthConfig;
    break;
  default:
    environmentSettings = prodConfig;
    authConfig = prodAuthConfig;
    break;
}

/**
 * Merge overrides the global settings with the appropriate environment settings
 */
export const config: ServerConfig = {
  ...globalConfig,
  ...environmentSettings,
  ...{
    databaseOptions: {
      ...globalConfig.databaseOptions,
      ...environmentSettings.databaseOptions,
    },
  },
};
