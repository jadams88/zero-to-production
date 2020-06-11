import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as ExampleActions from './demo.actions';
import {
  createReducer,
  on,
  Action,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { IExample } from '../example.interface';

export const exampleEntityStateKey = 'demoState';

export interface DemoState {
  examples: EntityState<IExample>;
}

export const adapter: EntityAdapter<IExample> = createEntityAdapter<IExample>();

export const initialDemoState: DemoState = {
  examples: adapter.getInitialState(),
};

export const demoReducer = createReducer(
  initialDemoState,
  on(ExampleActions.addExamples, (state, { examples }) => {
    return { examples: adapter.setAll(examples, state.examples) };
  })
);

export function reducer(state: DemoState | undefined, action: Action) {
  return demoReducer(state, action);
}

export const selectDemoState = createFeatureSelector<DemoState>(
  exampleEntityStateKey
);

export const selectExamples = createSelector(
  selectDemoState,
  (state) => state.examples
);

export const {
  selectEntities: selectExampleEntities,
  selectAll: selectAllExamples,
} = adapter.getSelectors(selectExamples);
