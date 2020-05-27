import { IUser } from '@ztp/data';
import mongoose from 'mongoose';

export function newId() {
  return mongoose.Types.ObjectId().toHexString();
}

/**
 * A mock user to test the auth routes
 */
export class MockUserModel {
  _userProps = ['id', 'username'];
  static _user: IUser | null | undefined;
  _user: IUser;

  constructor(user: IUser) {
    this._user = { ...user };
  }

  static set userToRespondWith(user: IUser | null) {
    if (!user) {
      this._user = user;
    } else {
      this._user = { ...user } as IUser;
    }
  }

  static async findByUsername(username: string) {
    if (this._user && username === this._user.username) {
      return this._user;
    } else {
      return null;
    }
  }

  static async findById(id: string) {
    if (this._user && id === this._user.id) {
      return this._user;
    } else {
      return null;
    }
  }

  static findOne(details: any) {
    const user = this._user;
    return {
      exec: async () => {
        return user;
      },
    };
  }

  static reset() {
    this._user = undefined;
  }

  toJSON() {
    return this._userProps.reduce((acc, curr) => {
      acc[curr] = (this._user as any)[curr];
      return acc;
    }, {} as any);
  }

  set(details: any) {
    this._user = { ...this._user, ...details };
  }

  async save() {
    if (!this._user.id) {
      this._user.id = newId();
    }
    return this.toJSON();
  }
}
