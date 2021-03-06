import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormInputComponent } from './fields/input/input.component';
import { FormSelectComponent } from './fields/select/select.component';
import { FormDatePickerComponent } from './fields/date-picker/date-picker.component';
import { FormTextAreaComponent } from './fields/textarea/textarea.component';
import { FormCheckBoxComponent } from './fields/checkbox/checkbox.components';

const COMPONENTS = [
  FormInputComponent,
  FormSelectComponent,
  FormDatePickerComponent,
  FormTextAreaComponent,
  FormCheckBoxComponent,
];

@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatCheckboxModule,
    TextFieldModule,
  ],
  exports: COMPONENTS,
})
export class CommonDynamicFormMaterialComponentsModule {}
