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
  selectedExampleUrl: string | null;
}
export interface DemoState {
  examples: ExampleEntityState;
}

export const adapter: EntityAdapter<IExample> = createEntityAdapter<IExample>({
  selectId: (e: IExample) => e.url,
});

export const initialDemoState: DemoState = {
  examples: adapter.getInitialState({
    selectedExampleUrl: null,
  }),
};

export const demoReducer = createReducer(
  initialDemoState,
  on(ExampleActions.addExamples, (state, { examples }) => {
    return { examples: adapter.setAll(examples, state.examples) };
  }),
  on(ExampleActions.selectExample, (state, { url }) => {
    return { examples: { ...state.examples, selectedExampleUrl: url } };
  }),
  on(ExampleActions.clearSelected, (state) => {
    return { examples: { ...state.examples, selectedExampleUrl: null } };
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

export const selectCurrentExampleUrl = createSelector(
  selectExamples,
  (state: ExampleEntityState) => state.selectedExampleUrl
);

export const selectCurrentExample = createSelector(
  selectExampleEntities,
  selectCurrentExampleUrl,
  (exampleEntities, url) => exampleEntities[url as any]
);
