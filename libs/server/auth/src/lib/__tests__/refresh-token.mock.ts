import { BaseMockModel } from './base-mock';
import { Refresh } from '../types';

export class MockRefreshModel extends BaseMockModel<Refresh> {
  _props = ['id', 'user', 'token'];

  constructor(token: Refresh) {
    super(token);
    return new Proxy(this, this);
  }

  static set tokenToRespondWith(token: any | null) {
    if (token) {
      this._model = new MockRefreshModel(token);
    } else {
      this._model = null;
    }
  }

  static async findByToken(token: string) {
    if (this._model && this._model._details.token === token) {
      return this._model;
    } else {
      return null;
    }
  }

  static async removeByToken(token: string) {
    if (this._model && this._model._details.token === token) {
      this._model = null;
      return null;
    } else {
      return this._model;
    }
  }

  static async removeUserTokens(id: string) {
    if (this._model && this._model._details) {
      if (this._model._details.user.id === id) {
        return { ok: 1, n: 1 };
      } else {
        return { ok: 1, n: 0 };
      }
    } else {
      return { ok: 1, n: 0 };
    }
  }

  async remove() {
    this._details = undefined as any;
    MockRefreshModel.tokenToRespondWith = null;
    return this;
  }
}
