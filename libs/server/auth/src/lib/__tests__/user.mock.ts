import { IUser } from '@ztp/data';
import { Types } from 'mongoose';

/**
 * A mock user to test the auth routes
 */
export class MockUserModel {
  static _userModel: MockUserModel | null;
  _userProps = [
    'id',
    'username',
    'email',
    'active',
    'isVerified',
    'hashedPassword',
  ];

  _user: IUser;

  constructor(user: IUser) {
    this._user = { ...user };
    return new Proxy(this, this);
  }

  static set userToRespondWith(user: IUser | null) {
    if (user) {
      this._userModel = new MockUserModel(user);
    } else {
      this._userModel = null;
    }
  }

  static get currentSetModel() {
    return (this._userModel as any) as IUser;
  }

  static async findByUsername(username: string) {
    const currentUser = this._userModel;
    if (currentUser) {
      const user = currentUser.toJSON();

      if (user && username === user.username) {
        return currentUser;
      }
    }
    return null;
  }

  static async findById(id: string) {
    const currentUser = this._userModel;

    if (currentUser) {
      const user = currentUser.toJSON();

      if (currentUser && id === (currentUser as any).id) {
        return currentUser;
      }
    }
    return null;
  }

  static findOne(details: any) {
    const currentUser = this._userModel;
    return {
      exec: async () => {
        return currentUser;
      },
    };
  }

  static reset() {
    this._userModel = null;
  }

  get(target: this, prop: symbol | string | number, receiver: this) {
    if ((target as any)[prop]) return (target as any)[prop];

    const isProp = target._userProps.includes(prop as string);
    if (isProp) {
      return (target._user as any)[prop as string];
    }
    return undefined;
  }

  set(
    target: this,
    prop: string | number | symbol,
    value: any,
    receiver: this
  ) {
    if (
      !target.hasOwnProperty(prop) &&
      this._userProps.includes(prop as string)
    ) {
      target._user = { ...target._user, ...{ [prop]: value } };
    }

    return true;
  }

  toJSON(): IUser | null {
    if (!this._user) return null;

    return this._userProps.reduce((acc, curr) => {
      if ((this._user as any)[curr]) {
        acc[curr] = (this._user as any)[curr];
      }
      return acc;
    }, {} as any);
  }

  async remove() {
    this._user = undefined as any;
    MockUserModel.userToRespondWith = null;
    return true;
  }

  async save() {
    if (!this._user.id) {
      this._user.id = Types.ObjectId().toHexString();
    }
    return this._user;
  }
}
