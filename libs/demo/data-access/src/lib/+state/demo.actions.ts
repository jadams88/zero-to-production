import { createAction, props } from '@ngrx/store';
import { IExample } from '../example.interface';

export const addExamples = createAction(
  '[Example] Add',
  props<{ examples: IExample[] }>()
);

export const selectExample = createAction(
  '[Example] Select',
  props<{ id: string }>()
);

export const clearSelected = createAction('[Example] Clear');
