import mongoose from 'mongoose';

export function newId() {
  return mongoose.Types.ObjectId().toHexString();
}

/**
 * A mock VerificationToken to test the auth routes
 */
export class MockVerificationToken {
  static _token: any | null | undefined;
  _details: any;
  // _token: any;

  constructor(details: { userId: string; token: string }) {
    this._details = details;
  }

  static set tokenToRespondWith(token: any | null) {
    if (!token) {
      this._token = token;
    } else {
      this._token = { ...token };
    }
  }

  static findOne(details: any) {
    const token = this._token;
    return {
      exec: async () => {
        return token;
      },
    };
  }

  static reset() {
    this._token = undefined;
  }

  get token() {
    if (this._details) {
      return this._details.token;
    }
    return null;
  }

  async remove() {
    this._details = null;
    return true;
  }

  async save() {
    if (!this._details.id) {
      this._details.id = newId();
    }
    return this._details;
  }
}
