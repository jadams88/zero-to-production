import { NgModule } from '@angular/core';
import { LazyComponentOne } from './lazy-component-one.component';

@NgModule({
  imports: [],
  declarations: [LazyComponentOne],
})
export class LazyModuleOne {
  static get lazyEntryComponent() {
    return LazyComponentOne;
  }
}
