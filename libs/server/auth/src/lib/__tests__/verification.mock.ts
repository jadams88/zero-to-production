import { Types } from 'mongoose';

/**
 * A mock VerificationToken to test the auth routes
 */
export class MockVerificationToken {
  static _tokenModel: MockVerificationToken | null;
  _tokenProps = ['userId', 'token'];
  _details: { id?: string; userId: string; token: string };

  constructor(details: { userId: string; token: string }) {
    this._details = { ...details };

    return new Proxy(this, this);
  }

  static set tokenToRespondWith(token: any | null) {
    if (token) {
      this._tokenModel = new MockVerificationToken(token);
    } else {
      this._tokenModel = null;
    }
  }

  static get currentSetModel() {
    return (this._tokenModel as any) as { userId: string; token: string };
  }

  static findOne(details: any) {
    const token = this._tokenModel;
    return {
      exec: async () => {
        return token;
      },
    };
  }

  static reset() {
    this._tokenModel = null;
  }

  get(target: this, prop: symbol | string | number, receiver: this) {
    if ((target as any)[prop]) return (target as any)[prop];
    const isProp = target._tokenProps.includes(prop as string);

    if (isProp) {
      return (target._details as any)[prop as string];
    }
    return undefined;
  }

  set(
    target: this,
    prop: string | number | symbol,
    value: any,
    receiver: this
  ) {
    if (target.hasOwnProperty(prop)) {
      (target as any)[prop] = value;
    } else if (this._tokenProps.includes(prop as string)) {
      target._details = { ...target._details, ...{ [prop]: value } } as any;
    }
    return true;
  }

  toJSON(): { userId: string; token: string } | null {
    if (!this._details) return null;

    return this._tokenProps.reduce((acc, curr) => {
      if ((this._details as any)[curr]) {
        acc[curr] = (this._details as any)[curr];
      }
      return acc;
    }, {} as any);
  }

  async remove() {
    this._details = undefined as any;
    MockVerificationToken.tokenToRespondWith = null;
    return true;
  }

  async save() {
    if (!this._details?.id) {
      this._details.id = Types.ObjectId().toHexString();
    }
    return this._details;
  }
}
