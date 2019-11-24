import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExamplesEntityState, adapter } from './examples.reducer';
import { IExample } from '@ngw/types';

export const selectExampleState = createFeatureSelector<ExamplesEntityState>(
  'examplesState'
);

export const {
  selectEntities: selectExampleEntities,
  selectAll: selectAllExamples
} = adapter.getSelectors(selectExampleState);

export const selectCurrentExampleUrl = createSelector(
  selectExampleState,
  (state: ExamplesEntityState) => state.selectedExampleUrl
);

export const selectExampleSearchFilter = createSelector(
  selectExampleState,
  (state: ExamplesEntityState) => state.searchFilter
);

export const selectCurrentExample = createSelector(
  selectExampleEntities,
  selectCurrentExampleUrl,
  (exampleEntities, url) => exampleEntities[String(url)]
);
