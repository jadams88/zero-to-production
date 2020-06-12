import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScrollingExampleComponent } from './scrolling-example/scrolling-example.component';
import {
  LAZY_MODULE_REGISTRY,
  CommonUtilsDynamicModuleLoadingModule,
} from '@ztp/common/utils/dynamic-module-loading';
import { LAZY_MODULES } from './lazy-modules';
import { LazyScrolling } from './scrolling/lazy-scrolling.component';

const ROUTES: Routes = [{ path: '', component: ScrollingExampleComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    CommonUtilsDynamicModuleLoadingModule,
  ],
  declarations: [ScrollingExampleComponent, LazyScrolling],
  providers: [
    {
      provide: LAZY_MODULE_REGISTRY,
      useValue: LAZY_MODULES,
    },
  ],
})
export class DemoLazyLoadScrollingModule {}
