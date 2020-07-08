import { Schema, Connection, Model, Document } from 'mongoose';
import { defaultSchemaOptions } from '@ztp/server/utils';
import { IUser } from '@ztp/data';
import { IUserDocument } from '../users/user';
import { TSchemaDefinition } from '../interface';

export interface IVerificationToken {
  id: string;
  userId: IUser;
  token: string;
}
export const verificationTokenDbKey = 'verificationToken';

export const verificationSchemaDef: TSchemaDefinition<IVerificationToken> = {
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
};

export const verificationTokenSchema = new Schema<IVerificationToken>(
  verificationSchemaDef,
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

export async function createVerificationTokenModel(
  con: Connection
): Promise<IVerificationTokenModel> {
  const m = con.model<IVerificationTokenDocument, IVerificationTokenModel>(
    verificationTokenDbKey,
    verificationTokenSchema
  );
  await m.createCollection();
  return m;
}

export function getVerificationTokenModel(
  con: Connection
): IVerificationTokenModel {
  return con.model<IVerificationTokenDocument, IVerificationTokenModel>(
    verificationTokenDbKey
  );
}
