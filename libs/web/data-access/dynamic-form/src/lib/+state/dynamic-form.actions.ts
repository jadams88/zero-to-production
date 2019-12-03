import { createAction, props } from '@ngrx/store';
import { IDynamicFormConfig } from './dynamic-form.reducer';
import { ValidatorFn, ValidationErrors } from '@angular/forms';
import { TFormGroups } from '../dynamic-form.models';

export const updateFormData = createAction(
  '[Dynamic Form] Update Data',
  props<{ data: any }>()
);

export const setFormStructure = createAction(
  '[Dynamic Form] Set Structure',
  props<{ structure: TFormGroups }>()
);

export const setFormErrors = createAction(
  '[Dynamic Form] Set Errors',
  props<{ errors: ValidationErrors }>()
);

export const setFormErrorsComplete = createAction(
  '[Dynamic Form] Set Errors Complete',
  props<{ errors: string[] }>()
);

export const gotToIndex = createAction(
  '[Dynamic Form] Go To',
  props<{ index: number }>()
);

export const nextIndex = createAction('[Dynamic Form] Next');

export const backIndex = createAction('[Dynamic Form] Back');

export const resetIndex = createAction('[Dynamic Form] Reset');

export const clearFormErrors = createAction('[Dynamic Form] Clear Errors');

export const resetForm = createAction('[Dynamic Form] Reset ');

export const setFormConfig = createAction(
  '[Dynamic Form] Set Config',
  props<{ config: IDynamicFormConfig }>()
);

export const resetFormConfig = createAction('[Dynamic Form] Reset Config');

export const submitForm = createAction('[Dynamic Form] Submit');

export const setFormValidators = createAction(
  '[Dynamic Form] Set Validators',
  props<{ validators: ValidatorFn[] }>()
);

export const resetFormValidators = createAction(
  '[Dynamic Form] Reset Validators'
);
