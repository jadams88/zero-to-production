import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExampleCreateFormComponent } from './create/create.component';
import { ExampleBuildFormComponent } from './build/build.component';
import { ExampleDisplayFormComponent } from './display/display.component';
import { CustomMaterialModule } from '@ngw/common/ui/custom-material';
import { DataAccessDynamicFormModule } from '@ngw/data-access/dynamic-form';
import { DataAccessFormBuilderModule } from '@ngw/data-access/form-builder';
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
    DataAccessDynamicFormModule,
    DataAccessFormBuilderModule,
    ExamplesFormBuilderRouterModule
  ]
})
export class WebExamplesFormBuilderModule {}
