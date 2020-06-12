import { NgModule } from '@angular/core';
import { LazyComponentTwo } from './lazy-component-two.component';

@NgModule({
  imports: [],
  declarations: [LazyComponentTwo],
})
export class LazyModuleTwo {
  static get lazyEntryComponent() {
    return LazyComponentTwo;
  }
}
