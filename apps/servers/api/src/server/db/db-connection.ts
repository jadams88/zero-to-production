import mongoose from 'mongoose';
import config from '../../environments';

const uri = `mongodb://${config.database.host}:${config.database.port}`;

export async function dbConnection(
  url = uri,
  opts = config.databaseOptions
): Promise<mongoose.Mongoose | undefined> {
  const connectionOptions: mongoose.ConnectionOptions = {
    ...opts,
    user: config.database.user,
    pass: config.database.pass,
    dbName: config.database.dbName
  };

  try {
    return await mongoose.connect(url, connectionOptions);
  } catch (err) {
    console.error('There was an error connecting to the DataBase');
    console.error(err);
    // Exit the application?
  }
}
