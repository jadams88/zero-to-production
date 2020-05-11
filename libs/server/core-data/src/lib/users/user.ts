import { Connection, Schema, Document, Model } from 'mongoose';
import { IUser } from '@ztp/data';
import { defaultSchemaOptions } from '@ztp/server/utils';
import { TSchemaDefinition } from '../interface';
export { userTypeDef } from './user.type';

export const userDbKey = 'user';

const schemaDefinition: TSchemaDefinition<IUser> = {
  username: {
    type: String,
    required: true,
    text: true,
    unique: true,
  },
  givenName: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: false, // ZTP_AFTER_CLONE -> set `unique: true`
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  hashedPassword: {
    type: String,
    required: true,
    select: false,
  },
};

export const userSchema = new Schema<IUser>(schemaDefinition, {
  ...defaultSchemaOptions,
});

export class UserClass extends Model {
  /**
   * This function is only used for the auth function and hence, must return the hashed password
   *
   * @param username The username to search by.
   */
  static findByUsername(username: string): Promise<IUserDocument | null> {
    return this.findOne({
      username,
    })
      .select('+hashedPassword')
      .exec();
  }

  static findByEmail(email: string): Promise<IUserDocument | null> {
    return this.findOne({
      email,
    }).exec();
  }

  static findByUserId(id: string | undefined): Promise<IUserDocument | null> {
    return super.findById(id).exec();
  }
}

userSchema.loadClass(UserClass);

export function createUserModel(con: Connection): IUserModel {
  return con.model<IUserDocument, IUserModel>(userDbKey, userSchema);
}

export function getUserModel(con: Connection): IUserModel {
  return con.model<IUserDocument, IUserModel>(userDbKey);
}

export interface IUserDocument extends IUser, Document {
  id: string;
}

export interface IUserModel extends Model<IUserDocument> {
  findByUsername(username: string): Promise<IUserDocument | null>;
  findByEmail(username: string): Promise<IUserDocument | null>;
  findByUserId(id: string | undefined): Promise<IUserDocument | null>;
}
