import { createReducer, on, Action } from '@ngrx/store';
import * as FormActions from './dynamic-form.actions';
import { ValidatorFn, ValidationErrors } from '@angular/forms';
import { TFormGroups } from '../dynamic-form.models';

export interface DynamicFormState {
  config: IDynamicFormConfig;
  index: number;
  data: any;
  structure: TFormGroups;
  formValidators: ValidatorFn[];
  errors: string[];
}

export interface IDynamicFormConfig {
  animations?: boolean;
  paginateSections?: boolean;
}

export const initialFormConfig: IDynamicFormConfig = {
  animations: true,
  paginateSections: true
};

export const initialFormState: DynamicFormState = {
  config: initialFormConfig,
  index: 0,
  data: {},
  structure: [],
  formValidators: [],
  errors: []
};

export const formReducer = createReducer(
  initialFormState,
  on(FormActions.updateFormData, (state, { data }) => {
    return { ...state, data };
  }),
  on(FormActions.setFormStructure, (state, { structure }) => {
    return { ...state, structure: [...structure] };
  }),
  on(FormActions.setFormErrorsComplete, (state, { errors }) => {
    return { ...state, errors };
  }),
  on(FormActions.clearFormErrors, state => {
    return { ...state, errors: [] };
  }),
  on(FormActions.resetForm, state => {
    return initialFormState;
  }),
  on(FormActions.resetFormValidators, state => {
    return { ...state, formValidators: [] };
  }),
  on(FormActions.setFormValidators, (state, { validators }) => {
    return { ...state, formValidators: validators };
  }),
  on(FormActions.resetIndex, state => {
    return { ...state, index: 0 };
  }),
  on(FormActions.gotToIndex, (state, { index }) => {
    return { ...state, index };
  }),
  on(FormActions.nextIndex, state => {
    return {
      ...state,
      index:
        state.index < state.structure.length - 1 ? state.index + 1 : state.index
    };
  }),
  on(FormActions.backIndex, state => {
    return { ...state, index: state.index <= 1 ? 0 : state.index - 1 };
  }),
  on(FormActions.setFormConfig, (state, { config }) => {
    return { ...state, config: { ...state.config, ...config } };
  }),
  on(FormActions.resetFormConfig, state => {
    return { ...state, config: initialFormConfig };
  })
);

export function reducer(state: DynamicFormState | undefined, action: Action) {
  return formReducer(state, action);
}
