import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingComponent } from './scrolling/scrolling.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ScrollingComponent],
})
export class DemoLazyLoadScrollingModule {
  static get lazyEntryComponent() {
    return ScrollingComponent;
  }
}
