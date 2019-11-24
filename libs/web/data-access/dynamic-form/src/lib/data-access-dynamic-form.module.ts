import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CustomMaterialModule } from '@ngw/common/ui/custom-material';
import { DynamicFormComponent } from './form/form.component';
import { FormInputComponent } from './fields/input/input.component';
import { FormSelectComponent } from './fields/select/select.component';
import { DynamicFormFieldDirective } from './fields/form-field.directive';
import { DynamicFormsEffects } from './+state/dynamic-form.effects';
import { reducer, initialFormState } from './+state/dynamic-form.reducer';
import { FormErrorsComponent } from './form-errors/form-errors.component';
import { FormErrorPipe } from './form-errors/form-error.pipe';
import { FormToggleComponent } from './fields/toggle/toggle.components';
import { FormDatePickerComponent } from './fields/date-picker/date-picker.component';
import { FormTextareaComponent } from './fields/textarea/textarea.component';
import { DynamicFormService } from './form.service';
import { FormErrorsService } from './form-errors/form-errors.service';

const ENTRY_COMPONENTS = [
  FormInputComponent,
  FormSelectComponent,
  FormToggleComponent,
  FormDatePickerComponent,
  FormTextareaComponent,
  FormErrorsComponent
];

const COMPONENTS = [
  ...ENTRY_COMPONENTS,
  DynamicFormComponent,
  FormErrorsComponent,
  FormErrorsComponent,
  FormErrorPipe
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    StoreModule.forFeature('dynamicForm', reducer, {
      initialState: initialFormState
    }),
    EffectsModule.forFeature([DynamicFormsEffects])
  ],
  declarations: [DynamicFormFieldDirective, ...COMPONENTS],
  providers: [DynamicFormService, FormErrorsService],
  entryComponents: [...ENTRY_COMPONENTS],
  exports: [DynamicFormComponent]
})
export class DataAccessDynamicFormModule {}
