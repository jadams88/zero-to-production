import { BaseMockModel } from './base-mock';
import { Verify } from '../types';

/**
 * A mock VerificationToken to test the auth routes
 */
export class MockVerifyModel extends BaseMockModel<Verify> {
  _props = ['userId', 'token'];

  constructor(details: any) {
    super(details);
    return new Proxy(this, this);
  }

  static set tokenToRespondWith(token: any | null) {
    if (token) {
      this._model = new MockVerifyModel(token);
    } else {
      this._model = null;
    }
  }

  static async findByToken(token: string) {
    const setToken = this._model;
    if (setToken) {
      const t = setToken.toJSON();
      if (token && token === t.token) {
        return setToken;
      }
    }
    return null;
  }

  async remove() {
    this._details = undefined as any;
    MockVerifyModel.tokenToRespondWith = null;
    return this;
  }
}
