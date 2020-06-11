import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonDynamicFormModule } from '@ztp/common/dynamic-form';
import { ExampleDynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DemoUtilsModule } from '@ztp/demo/utils';
import { MatButtonModule } from '@angular/material/button';

const ROUTES: Routes = [{ path: '', component: ExampleDynamicFormComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    CommonDynamicFormModule.forChild(),
    MatCheckboxModule,
    DemoUtilsModule,
    MatButtonModule,
  ],
  declarations: [ExampleDynamicFormComponent],
})
export class DemoDynamicFormModule {}
