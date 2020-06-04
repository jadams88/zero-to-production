import { Refresh } from '../auth.interface';
import { BaseMockModel } from './base-mock';

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

  async remove() {
    this._details = undefined as any;
    MockRefreshModel.tokenToRespondWith = null;
    return this;
  }
}
