import { IUser } from '@ztp/data';
import { BaseMockModel } from './base-mock';

/**
 * A mock user to test the auth routes
 */
export class MockUserModel extends BaseMockModel<IUser> {
  _props = [
    'id',
    'username',
    'email',
    'active',
    'isVerified',
    'hashedPassword',
  ];

  constructor(user: IUser) {
    super(user);
    return new Proxy(this, this);
  }

  static set userToRespondWith(user: IUser | null) {
    if (user) {
      this._model = new this(user);
    } else {
      this._model = null;
    }
  }

  static async findByUsername(username: string) {
    // return this.findOne({ username });
    const currentUser = this._model;
    if (currentUser) {
      const user = currentUser.toJSON();

      if (user && username === user.username) {
        return currentUser;
      }
    }
    return null;
  }

  async remove() {
    this._details = undefined as any;
    MockUserModel.userToRespondWith = null;
    return null;
  }
}
