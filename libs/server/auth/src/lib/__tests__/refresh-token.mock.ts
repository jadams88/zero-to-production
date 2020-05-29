import { IRefreshToken } from '../auth.interface';
import { IUser } from '@ztp/data';
import { Types } from 'mongoose';

export class MockRefreshTokenModel {
  static _model: MockRefreshTokenModel | null | undefined;
  _tokenProps = ['id', 'user', 'token'];
  _token: IRefreshToken;

  constructor(token: IRefreshToken) {
    this._token = { ...token };
  }

  // static async create(token: { user: IUser; token: string }) {
  //   return new MockRefreshTokenModel((token as unknown) as IRefreshToken);
  // }

  static set tokenToRespondWith(token: any | null) {
    if (token) {
      this._model = new MockRefreshTokenModel(token);
    } else {
      this._model = null;
    }
  }

  static get currentSetModel() {
    return this._model;
  }

  static findOne(details: any) {
    const token = this._model;
    return {
      exec: async () => {
        return token;
      },
    };
  }

  static async findByTokenWithUser(tokenString: string) {
    if (this._model && this._model?._token.token === tokenString) {
      return this._model;
    } else {
      return null;
    }
  }

  static reset() {
    this._model = null;
  }

  get(target: this, prop: symbol | string | number, receiver: this) {
    if ((target as any)[prop]) return (target as any)[prop];
    const isProp = target._tokenProps.includes(prop as string);

    if (isProp) {
      return (target._token as any)[prop as string];
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
      target._token = { ...target._token, ...{ [prop]: value } } as any;
    }
    return true;
  }

  toJSON(): { userId: string; token: string } | null {
    if (!this._token) return null;

    return this._tokenProps.reduce((acc, curr) => {
      if ((this._token as any)[curr]) {
        acc[curr] = (this._token as any)[curr];
      }
      return acc;
    }, {} as any);
  }

  async remove() {
    this._token = undefined as any;
    MockRefreshTokenModel.tokenToRespondWith = null;
    return true;
  }

  async save() {
    if (!this._token?.id) {
      this._token.id = Types.ObjectId().toHexString();
    }
    return this._token;
  }
}
