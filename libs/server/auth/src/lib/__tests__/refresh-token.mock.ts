import { IRefreshToken } from '../auth.interface';
import { BaseMockModel } from './base-mock';

export class MockRefreshTokenModel extends BaseMockModel<IRefreshToken> {
  _props = ['id', 'user', 'token'];

  constructor(token: IRefreshToken) {
    super(token);
    return new Proxy(this, this);
  }

  static set tokenToRespondWith(token: any | null) {
    if (token) {
      this._model = new MockRefreshTokenModel(token);
    } else {
      this._model = null;
    }
  }

  static async findByTokenWithUser(token: string) {
    if (this._model && this._model?._details.token === token) {
      return this._model;
    } else {
      return null;
    }
  }

  async remove() {
    this._details = undefined as any;
    MockRefreshTokenModel.tokenToRespondWith = null;
    return null;
  }
}
