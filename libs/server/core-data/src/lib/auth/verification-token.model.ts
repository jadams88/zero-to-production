import { Schema, Connection, Model, Document } from 'mongoose';
import { defaultSchemaOptions } from '@ztp/server/utils';
import { IUser } from '@ztp/data';
import { IUserDocument } from '../users/user.js';

export interface IVerificationToken {
  id: string;
  userId: IUser;
  token: string;
}
export const verificationTokenDbKey = 'verificationToken';

export const verificationTokenSchema = new Schema<IVerificationToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    ...defaultSchemaOptions,
  }
);

export interface IVerificationTokenDocument extends Document {
  id: string;
  userId: IUserDocument;
  token: string;
}

export interface IVerificationTokenModel
  extends Model<IVerificationTokenDocument> {
  findByToken(token: string): Promise<IVerificationTokenDocument | null>;
}

export class VerificationTokenClass extends Model {
  static findByToken(
    token: string
  ): Promise<IVerificationTokenDocument | null> {
    return this.findOne({
      token,
    }).exec();
  }
}

verificationTokenSchema.loadClass(VerificationTokenClass);

export function createVerificationTokenModel(
  con: Connection
): IVerificationTokenModel {
  return con.model<IVerificationTokenDocument, IVerificationTokenModel>(
    verificationTokenDbKey,
    verificationTokenSchema
  );
}

export function getVerificationTokenModel(
  con: Connection
): IVerificationTokenModel {
  return con.model<IVerificationTokenDocument, IVerificationTokenModel>(
    verificationTokenDbKey
  );
}
