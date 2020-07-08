import { Connection } from 'mongoose';
import {
  createUserModel,
  createTodoModel,
  createTodoNoteModel,
  createRefreshTokenModel,
  createVerificationTokenModel,
} from '@ztp/server/core-data';

/**
 * Initialize all mongoose schemas
 *
 * Add additional schemas here
 *
 * @param connection mongoose connection
 */
export async function initDbSchemasModels(conn: Connection) {
  await Promise.all([
    createUserModel(conn),
    createRefreshTokenModel(conn),
    createVerificationTokenModel(conn),
    createTodoModel(conn),
    createTodoNoteModel(conn),
  ]);

  return conn;
}
