import { ConnectionOptions } from 'mongoose';
/*
 * https://mongoosejs.com/docs/api.html#mongoose_Mongoose-connect
 * http://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient.html
 */

export interface GlobalServerConfig {
  port?: number;
  databaseOptions: ConnectionOptions;
  dbConnectionString?: string;
  production?: boolean;
  sendgridApiKey?: string;
}

export type EnvironnementConfig =
  | ProductionServerConfig
  | DevServerConfig
  | TestServerConfig;

export interface DevServerConfig {
  production: false;
  dbConnectionString: string;
  databaseOptions: ConnectionOptions;
}

export interface TestServerConfig {
  production: false;
  dbConnectionString: string;
  databaseOptions: ConnectionOptions;
}

export interface ProductionServerConfig {
  production: true;
  dbConnectionString: string;
  databaseOptions?: ConnectionOptions;
}

export type ServerConfig = GlobalServerConfig & EnvironnementConfig;
