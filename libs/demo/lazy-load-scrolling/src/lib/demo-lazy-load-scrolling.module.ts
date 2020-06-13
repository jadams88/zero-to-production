import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  LAZY_MODULES,
  CommonDynamicModuleLoadingModule,
} from '@ztp/common/dynamic-module-loading';
import { ScrollingExampleComponent } from './scrolling-example/scrolling-example.component';
import { MODULES } from './lazy-modules';

const ROUTES: Routes = [{ path: '', component: ScrollingExampleComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    CommonDynamicModuleLoadingModule,
  ],
  declarations: [ScrollingExampleComponent],
  providers: [
    {
      provide: LAZY_MODULES,
      useValue: MODULES,
    },
  ],
})
export class DemoLazyLoadScrollingModule {}
