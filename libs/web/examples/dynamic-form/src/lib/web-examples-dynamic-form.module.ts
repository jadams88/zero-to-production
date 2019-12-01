import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamplesDynamicFormRouterModule } from './web-examples-dynamic-form-router.module';
import { ExampleDynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { CustomMaterialModule } from '@uqt/common/ui/custom-material';
import { CommonUiCardModule } from '@uqt/common/ui/card';
import { DynamicFormModule } from '@uqt/data-access/dynamic-form';

const COMPONENTS = [ExampleDynamicFormComponent];

@NgModule({
  imports: [
    CommonModule,
    CustomMaterialModule,
    CommonUiCardModule,
    DynamicFormModule,
    ExamplesDynamicFormRouterModule
  ],
  declarations: COMPONENTS
})
export class WebExamplesDynamicFormModule {}
