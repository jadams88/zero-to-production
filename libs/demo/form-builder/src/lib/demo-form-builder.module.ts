import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DemoUtilsModule } from '@ztp/demo/utils';
import { CommonUiButtonsModule } from '@ztp/common/ui/buttons';
import { CommonFormBuilderModule } from '@ztp/common/form-builder';
import { CommonDynamicFormModule } from '@ztp/common/dynamic-form';
import { ExampleFormBuilderCreateComponent } from './create/create.component';
import { ExampleFormBuilderDisplayComponent } from './display/display.component';
import { ExampleFormBuilderBuildComponent } from './build/build.component';
import { ExampleFormBuilderOverviewComponent } from './overview/overview.component';
import { CommonUiCardModule } from '@ztp/common/ui/card';

import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

const COMPONENTS = [
  ExampleFormBuilderCreateComponent,
  ExampleFormBuilderBuildComponent,
  ExampleFormBuilderDisplayComponent,
  ExampleFormBuilderOverviewComponent,
];

@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    CommonUiButtonsModule,
    CommonUiCardModule,
    FontAwesomeModule,
    MatListModule,
    MatButtonModule,
    CommonDynamicFormModule,
    CommonFormBuilderModule,
    DemoUtilsModule,
  ],
})
export class DemoFormBuilderModule {
  static get lazyEntryComponent() {
    return ExampleFormBuilderOverviewComponent;
  }
}
