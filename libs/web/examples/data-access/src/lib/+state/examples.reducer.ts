import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as ExampleActions from './examples.actions';
import { IExample } from '@ngw/types';
import { createReducer, on, Action } from '@ngrx/store';

export interface ExamplesEntityState extends EntityState<IExample> {
  selectedExampleUrl: string | null;
  searchFilter: string | null;
}

export function selectExampleUrl(example: IExample) {
  return example.url;
}

export const adapter: EntityAdapter<IExample> = createEntityAdapter<IExample>({
  selectId: selectExampleUrl
});

export const initialExampleState: ExamplesEntityState = adapter.getInitialState(
  {
    selectedExampleUrl: null,
    searchFilter: null
  }
);

export const examplesReducer = createReducer(
  initialExampleState,
  on(ExampleActions.selectExample, (state, { url }) => {
    return { ...state, selectedExampleUrl: url };
  }),
  on(ExampleActions.clearSelected, state => {
    return { ...state, selectedExampleId: null };
  }),
  on(ExampleActions.searchFilter, (state, { search }) => {
    return { ...state, searchFilter: search };
  }),
  on(ExampleActions.addExamples, (state, { examples }) => {
    return adapter.addAll(examples, state);
  })
);

export function reducer(
  state: ExamplesEntityState | undefined,
  action: Action
) {
  return examplesReducer(state, action);
}
