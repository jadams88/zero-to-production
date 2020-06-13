import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DemoLiveDemosRoutingModule } from './demo-live-demos-routing.module';
import { DemoExamplesComponent } from './example-demos/examples-demos.component';
import { ExampleDetailComponent } from './example-demos/example-detail/example-detail.component';
import {
  CommonDynamicModuleLoadingModule,
  LAZY_MODULE_REGISTRY,
} from '@ztp/common/dynamic-module-loading';
import { LAZY_MODULES } from './lazy-modules';
import { DemoDynamicFormModule } from '@ztp/demo/dynamic-form';
import { CommonUiLayoutsModule } from '@ztp/common/ui/layouts';

@NgModule({
  imports: [
    CommonModule,
    DemoLiveDemosRoutingModule,
    CommonUiLayoutsModule,
    CommonDynamicModuleLoadingModule,
    DemoDynamicFormModule,
    ScrollingModule, // only needed for drag & drop form builder
  ],
  declarations: [DemoExamplesComponent, ExampleDetailComponent],
  providers: [
    {
      provide: LAZY_MODULE_REGISTRY,
      useValue: LAZY_MODULES,
    },
  ],
})
export class DemoLiveDemosModule {}
