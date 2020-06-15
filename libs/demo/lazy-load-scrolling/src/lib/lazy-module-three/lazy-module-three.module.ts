import { NgModule } from '@angular/core';
import { LazyComponentThree } from './lazy-component-three.component';

@NgModule({
  imports: [],
  declarations: [LazyComponentThree],
})
export class LazyModuleThree {
  static get lazyEntryComponent() {
    return LazyComponentThree;
  }
}
