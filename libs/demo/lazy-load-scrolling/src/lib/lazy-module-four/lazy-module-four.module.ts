import { NgModule } from '@angular/core';
import { LazyComponentFour } from './lazy-component-four.component';

@NgModule({
  imports: [],
  declarations: [LazyComponentFour],
})
export class LazyModuleFour {
  static get lazyEntryComponent() {
    return LazyComponentFour;
  }
}
