import { Model, Document, Schema, Connection } from 'mongoose';
import { IUser } from '@ztp/data';
import { defaultSchemaOptions } from '@ztp/server/utils';
import { IUserDocument } from '../users';
import { TSchemaDefinition } from '../interface';

// -------------------------------------
// Interfaces for each Model
// -------------------------------------
export interface IRefreshToken {
  id: string;
  user: IUser;
  token: string;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document {
  id: string;
  user: IUserDocument;
}

export interface IRefreshTokenModel extends Model<IRefreshTokenDocument> {
  findByToken(token: string): Promise<IRefreshTokenDocument | null>;
}

/**
 * This resource is not publicly available but used to store all refresh tokens
 */

export const refreshTokenDbKey = 'refreshToken';

export const refreshSchemaDef: TSchemaDefinition<IRefreshToken> = {
  user: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  token: {
    required: true,
    type: String,
  },
};

export const refreshTokenSchema = new Schema(refreshSchemaDef, {
  ...defaultSchemaOptions,
});

export class RefreshTokenClass extends Model {
  static findByToken(token: string): Promise<IRefreshTokenDocument | null> {
    return this.findOne({ token }).populate('user').exec();
  }
}

refreshTokenSchema.loadClass(RefreshTokenClass);

export async function createRefreshTokenModel(
  con: Connection
): Promise<IRefreshTokenModel> {
  const m = con.model<IRefreshTokenDocument, IRefreshTokenModel>(
    refreshTokenDbKey,
    refreshTokenSchema
  );
  await m.createCollection();
  return m;
}

export function getRefreshTokenModel(con: Connection): IRefreshTokenModel {
  return con.model<IRefreshTokenDocument, IRefreshTokenModel>(
    refreshTokenDbKey
  );
}
