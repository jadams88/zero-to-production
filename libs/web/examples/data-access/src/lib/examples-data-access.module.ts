import { NgModule } from '@angular/core';
import { ExamplesFacade } from './+state/examples.facade';
import { StoreModule } from '@ngrx/store';
import {
  reducer,
  ExamplesEntityState,
  initialExampleState
} from './+state/examples.reducer';

@NgModule({
  providers: [ExamplesFacade],
  imports: [
    StoreModule.forFeature<ExamplesEntityState>('examplesState', reducer, {
      initialState: initialExampleState
    })
  ]
})
export class ExamplesDataAccessModule {}
