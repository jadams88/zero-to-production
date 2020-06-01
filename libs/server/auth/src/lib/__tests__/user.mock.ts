import { IUser } from '@ztp/data';
import { BaseMockModel } from './base-mock';

/**
 * A mock user to test the auth routes
 */
export class MockUserModel extends BaseMockModel<IUser> {
  // static _model: MockUserModel | null;
  _props = [
    'id',
    'username',
    'email',
    'active',
    'isVerified',
    'hashedPassword',
  ];

  // _details: IUser;

  constructor(user: IUser) {
    super(user);
    // this._details = { ...user };
    return new Proxy(this, this);
  }

  static set modelToRespondWith(user: IUser | null) {
    if (user) {
      this._model = new this(user);
    } else {
      this._model = null;
    }
  }

  static async findByUsername(username: string) {
    // return this.findOne({ username });
    const currentUser = this._model;
    if (currentUser) {
      const user = currentUser.toJSON();

      if (user && username === user.username) {
        return currentUser;
      }
    }
    return null;
  }

  // static async findById(id: string) {
  //   const currentUser = this._model;

  //   if (currentUser) {
  //     const user = currentUser.toJSON();

  //     if (currentUser && id === (currentUser as any).id) {
  //       return currentUser;
  //     }
  //   }
  //   return null;
  // }

  // static findOne(details: { [prop: string]: any }) {
  //   const model = this._model;
  //   return {
  //     exec: async () => {
  //       return model &&
  //         Object.keys(details).every(
  //           (prop: string, i: number) =>
  //             (model as any)[prop] && (model as any)[prop] === details[prop]
  //         )
  //         ? model
  //         : null;
  //     },
  //   };
  // }

  // static reset() {
  //   this._model = null;
  // }

  // get(target: this, prop: symbol | string | number, receiver: this) {
  //   if ((target as any)[prop]) return (target as any)[prop];

  //   const isProp = target._props.includes(prop as string);
  //   if (isProp) {
  //     return (target._details as any)[prop as string];
  //   }
  //   return undefined;
  // }

  // set(
  //   target: this,
  //   prop: string | number | symbol,
  //   value: any,
  //   receiver: this
  // ) {
  //   if (
  //     !target.hasOwnProperty(prop) &&
  //     target._props.includes(prop as string)
  //   ) {
  //     target._details = { ...target._details, ...{ [prop]: value } };
  //   }

  //   return true;
  // }

  // toJSON(): IUser | null {
  //   if (!this._details) return null;

  //   return this._props.reduce((acc, curr) => {
  //     if ((this._details as any)[curr]) {
  //       acc[curr] = (this._details as any)[curr];
  //     }
  //     return acc;
  //   }, {} as any);
  // }

  async remove() {
    this._details = undefined as any;
    MockUserModel.modelToRespondWith = null;
    return null;
  }

  // async save() {
  //   if (!this._details.id) {
  //     this._details.id = Types.ObjectId().toHexString();
  //   }
  //   return this._details;
  // }
}
