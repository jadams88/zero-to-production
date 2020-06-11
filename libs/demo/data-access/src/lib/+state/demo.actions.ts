import { createAction, props } from '@ngrx/store';
import { IExample } from '../example.interface';

export const addExamples = createAction(
  '[Example] Add',
  props<{ examples: IExample[] }>()
);
