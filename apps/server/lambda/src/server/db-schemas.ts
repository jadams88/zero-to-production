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
export function initDbSchemasModels(conn: Connection) {
  createUserModel(conn);
  createRefreshTokenModel(conn);
  createVerificationTokenModel(conn);
  createTodoModel(conn);
  createTodoNoteModel(conn);
}
