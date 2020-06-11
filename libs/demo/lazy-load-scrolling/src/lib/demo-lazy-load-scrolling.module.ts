import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScrollingComponent } from './scrolling/scrolling.component';

const ROUTES: Routes = [{ path: '', component: ScrollingComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ROUTES)],
  declarations: [ScrollingComponent],
})
export class DemoLazyLoadScrollingModule {
  static get lazyEntryComponent() {
    return ScrollingComponent;
  }
}
