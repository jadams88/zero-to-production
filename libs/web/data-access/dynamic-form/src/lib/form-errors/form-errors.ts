// TODO All form errors
export enum FormErrorTypes {
  required = 'required',
  email = 'email'
}

export type DynamicFormErrorsMap = {
  [key in FormErrorTypes]: string;
};

export const DefaultErrorMessages: DynamicFormErrorsMap = {
  required: 'is required',
  email: 'is not a valid email'
};
