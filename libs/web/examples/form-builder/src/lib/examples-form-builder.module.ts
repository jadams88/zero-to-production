import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExampleCreateFormComponent } from './create/create.component';
import { ExampleBuildFormComponent } from './build/build.component';
import { ExampleDisplayFormComponent } from './display/display.component';
import { CustomMaterialModule } from '@uqt/common/ui/custom-material';
import { DynamicFormModule } from '@uqt/data-access/dynamic-form';
import { DataAccessFormBuilderModule } from '@uqt/data-access/form-builder';
import { ExamplesFormBuilderRouterModule } from './examples-form-builder-router.module';

const COMPONENTS = [
  ExampleCreateFormComponent,
  ExampleBuildFormComponent,
  ExampleDisplayFormComponent
];

@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    CustomMaterialModule,
    DynamicFormModule,
    DataAccessFormBuilderModule,
    ExamplesFormBuilderRouterModule
  ]
})
export class WebExamplesFormBuilderModule {}
