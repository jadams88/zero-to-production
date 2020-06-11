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

export interface ExampleEntityState extends EntityState<IExample> {
  selectedExampleId: string | null;
}
export interface DemoState {
  examples: ExampleEntityState;
}

export const adapter: EntityAdapter<IExample> = createEntityAdapter<IExample>();

export const initialDemoState: DemoState = {
  examples: adapter.getInitialState({
    selectedExampleId: null,
  }),
};

export const demoReducer = createReducer(
  initialDemoState,
  on(ExampleActions.addExamples, (state, { examples }) => {
    return { examples: adapter.setAll(examples, state.examples) };
  }),
  on(ExampleActions.selectExample, (state, { id }) => {
    return { examples: { ...state.examples, selectedExampleId: id } };
  }),
  on(ExampleActions.clearSelected, (state) => {
    return { examples: { ...state.examples, selectedExampleId: null } };
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

export const selectCurrentExampleId = createSelector(
  selectExamples,
  (state: ExampleEntityState) => state.selectedExampleId
);

export const selectCurrentExample = createSelector(
  selectExampleEntities,
  selectCurrentExampleId,
  (exampleEntities, exampleId) => exampleEntities[String(exampleId)]
);
