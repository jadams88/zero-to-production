import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonDynamicFormModule } from '@ztp/common/dynamic-form';
import { ExampleDynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DemoUtilsModule } from '@ztp/demo/utils';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    CommonDynamicFormModule.forChild(),
    MatCheckboxModule,
    DemoUtilsModule,
    MatButtonModule,
  ],
  declarations: [ExampleDynamicFormComponent],
  exports: [ExampleDynamicFormComponent],
})
export class DemoDynamicFormModule {}
