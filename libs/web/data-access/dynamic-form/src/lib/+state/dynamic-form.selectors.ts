import { createFeatureSelector, createSelector } from '@ngrx/store';

import { DynamicFormState } from './dynamic-form.reducer';

const selectDynamicFormState = createFeatureSelector<DynamicFormState>(
  'dynamicForm'
);

export const selectStructure = createSelector(
  selectDynamicFormState,
  (state: DynamicFormState) => state.structure
);
export const selectData = createSelector(
  selectDynamicFormState,
  (state: DynamicFormState) => state.data
);

export const selectErrors = createSelector(
  selectDynamicFormState,
  (state: DynamicFormState) => state.errors
);

export const selectFormValidators = createSelector(
  selectDynamicFormState,
  state => state.formValidators
);

export const selectFormIndex = createSelector(
  selectDynamicFormState,
  state => state.index
);

export const selectFormConfig = createSelector(
  selectDynamicFormState,
  state => state.config
);
