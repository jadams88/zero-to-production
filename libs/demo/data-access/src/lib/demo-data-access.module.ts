import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as fromDemo from './+state/demo.reducer';

@NgModule({
  imports: [
    StoreModule.forFeature<fromDemo.DemoState>(
      fromDemo.exampleEntityStateKey,
      fromDemo.reducer
    ),
  ],
})
export class DemoDataAccessModule {}
