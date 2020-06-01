import { BaseMockModel } from './base-mock';

/**
 * A mock VerificationToken to test the auth routes
 */
export class MockVerificationToken extends BaseMockModel<{
  id?: string;
  userId: string;
  token: string;
}> {
  _props = ['userId', 'token'];

  constructor(details: { userId: string; token: string }) {
    super(details);
    return new Proxy(this, this);
  }

  static set tokenToRespondWith(token: any | null) {
    if (token) {
      this._model = new MockVerificationToken(token);
    } else {
      this._model = null;
    }
  }

  async remove() {
    this._details = undefined as any;
    MockVerificationToken.tokenToRespondWith = null;
    return null;
  }
}
