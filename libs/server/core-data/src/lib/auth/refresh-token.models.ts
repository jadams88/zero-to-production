import { Model, Document, Schema, Connection } from 'mongoose';
import { IUser } from '@ztp/data';
import { defaultSchemaOptions } from '@ztp/server/utils';
import { IUserDocument } from '../users/index.js';

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

export const refreshTokenSchema = new Schema(
  {
    user: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    token: {
      required: true,
      type: String,
    },
  },
  {
    ...defaultSchemaOptions,
  }
);

export class RefreshTokenClass extends Model {
  static findByToken(token: string): Promise<IRefreshTokenDocument | null> {
    return this.findOne({ token }).populate('user').exec();
  }
}

refreshTokenSchema.loadClass(RefreshTokenClass);

export function createRefreshTokenModel(con: Connection): IRefreshTokenModel {
  return con.model<IRefreshTokenDocument, IRefreshTokenModel>(
    refreshTokenDbKey,
    refreshTokenSchema
  );
}

export function getRefreshTokenModel(con: Connection): IRefreshTokenModel {
  return con.model<IRefreshTokenDocument, IRefreshTokenModel>(
    refreshTokenDbKey
  );
}
