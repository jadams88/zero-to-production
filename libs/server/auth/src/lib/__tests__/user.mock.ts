import { BaseMockModel } from './base-mock';
import { AuthUser, AuthUserModel } from '../types';

/**
 * A mock user to test the auth routes
 */
export class MockAuthUserModel extends BaseMockModel<AuthUser> {
  _props = [
    'id',
    'username',
    'email',
    'active',
    'isVerified',
    'hashedPassword',
  ];

  constructor(user: AuthUser) {
    super(user);
    return new Proxy(this, this);
  }

  static set userToRespondWith(user: AuthUser | null) {
    if (user) {
      this._model = new this(user);
    } else {
      this._model = null;
    }
  }

  static async findByUsername(username: string) {
    const currentUser = this._model;
    if (currentUser) {
      const user = currentUser.toJSON();

      if (user && username === user.username) {
        return currentUser;
      }
    }
    return null;
  }

  static async findByUserId(id: string) {
    const currentUser = this._model;
    if (currentUser) {
      const user = currentUser.toJSON();

      if (user && id === user.id) {
        return currentUser;
      }
    }
    return null;
  }

  static async findByEmail(email: string) {
    const currentUser = this._model;
    if (currentUser) {
      const user = currentUser.toJSON();

      if (user && email === user.email) {
        return currentUser;
      }
    }
    return null;
  }

  async remove() {
    this._details = undefined as any;
    MockAuthUserModel.userToRespondWith = null;
    return this;
  }
}
