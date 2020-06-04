export abstract class BaseMockModel<T> {
  static _model: any | null;
  abstract _props: string[];
  _details: any;

  constructor(props: any) {
    this._details = { ...props };
  }

  static get currentSetModel() {
    return this._model as any;
  }

  static async findById(id: string) {
    const model = this._model;

    if (model) {
      const user = model.toJSON();

      if (model && id === model.id) {
        return model;
      }
    }
    return null;
  }

  static findOne(details: { [prop: string]: any }) {
    const model = this._model;
    return {
      exec: async () => {
        return model &&
          Object.keys(details).every(
            (prop: string, i: number) =>
              model[prop] && model[prop] === details[prop]
          )
          ? model
          : null;
      },
    };
  }

  static reset() {
    this._model = null;
  }

  get(target: this, prop: symbol | string | number, receiver: this) {
    if ((target as any)[prop]) return (target as any)[prop];

    const isProp = target._props.includes(prop as string);
    if (isProp) {
      return target._details[prop];
    }
    return undefined;
  }

  set(
    target: this,
    prop: string | number | symbol,
    value: any,
    receiver: this
  ) {
    if (
      !target.hasOwnProperty(prop) &&
      target._props.includes(prop as string)
    ) {
      target._details = { ...target._details, ...{ [prop]: value } };
    }

    return true;
  }

  toJSON(): T | null {
    if (!this._details) return null;

    return this._props.reduce((acc, curr) => {
      if (this._details[curr]) {
        acc[curr] = this._details[curr];
      }
      return acc;
    }, {} as any);
  }

  save() {
    if (!this._details.id) {
      this._details.id = 'unique-id-123';
    }
    return Promise.resolve(this._details);
  }

  abstract async remove(): Promise<this>;
}
