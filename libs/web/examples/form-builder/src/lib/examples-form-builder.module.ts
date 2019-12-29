import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExampleCreateFormComponent } from './create/create.component';
import { ExampleBuildFormComponent } from './build/build.component';
import { ExampleDisplayFormComponent } from './display/display.component';
import { CustomMaterialModule } from '@uqt/common/ui/custom-material';
import { DynamicFormModule } from '@uqt/data-access/dynamic-form';
import { DataAccessFormBuilderModule } from '@uqt/data-access/form-builder';
import { OverviewComponent } from './overview/overview.component';
import { TempRoutingModule } from './temp-routing.module';

const COMPONENTS = [
  ExampleCreateFormComponent,
  ExampleBuildFormComponent,
  ExampleDisplayFormComponent,
  OverviewComponent
];

@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    CustomMaterialModule,
    DynamicFormModule,
    DataAccessFormBuilderModule,
    TempRoutingModule // TODO -> Delete
  ]
})
export class WebExamplesFormBuilderModule {
  static get lazyEntryComponent() {
    return OverviewComponent;
  }
}
