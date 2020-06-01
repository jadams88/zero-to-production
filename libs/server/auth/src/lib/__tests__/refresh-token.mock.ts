import { IRefreshToken } from '../auth.interface';
import { Types } from 'mongoose';

export class MockRefreshTokenModel {
  static _model: MockRefreshTokenModel | null | undefined;
  _props = ['id', 'user', 'token'];
  _details: IRefreshToken;

  constructor(token: IRefreshToken) {
    this._details = { ...token };
    return new Proxy(this, this);
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

  static findOne(details: { [prop: string]: any }) {
    const model = this._model;
    return {
      exec: async () => {
        return model &&
          Object.keys(details).every(
            (prop: string, i: number) =>
              (model as any)[prop] && (model as any)[prop] === details[prop]
          )
          ? model
          : null;
      },
    };
  }

  static async findByTokenWithUser(token: string) {
    // console.log(this._model?.kken);
    // console.log(token);
    if (this._model && this._model?._details.token === token) {
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
    const isProp = target._props.includes(prop as string);

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
    } else if (this._props.includes(prop as string)) {
      target._details = { ...target._details, ...{ [prop]: value } } as any;
    }
    return true;
  }

  toJSON(): { userId: string; token: string } | null {
    if (!this._details) return null;

    return this._props.reduce((acc, curr) => {
      if ((this._details as any)[curr]) {
        acc[curr] = (this._details as any)[curr];
      }
      return acc;
    }, {} as any);
  }

  async remove() {
    this._details = undefined as any;
    MockRefreshTokenModel.tokenToRespondWith = null;
    return true;
  }

  async save() {
    if (!this._details?.id) {
      this._details.id = Types.ObjectId().toHexString();
    }
    return this._details;
  }
}
