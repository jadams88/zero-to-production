import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CustomMaterialModule } from '@uqt/common/ui/custom-material';
import { DynamicFormComponent } from './form/form.component';
import { FormInputComponent } from './fields/input/input.component';
import { FormSelectComponent } from './fields/select/select.component';
import { DynamicFormFieldDirective } from './form/form-field.directive';
import { DynamicFormsEffects } from './+state/dynamic-form.effects';
import { reducer, initialFormState } from './+state/dynamic-form.reducer';
import { FormErrorsComponent } from './form-errors/form-errors.component';
import { FormErrorPipe } from './form-errors/form-error.pipe';
import { FormToggleComponent } from './fields/toggle/toggle.components';
import { FormDatePickerComponent } from './fields/date-picker/date-picker.component';
import { FormTextAreaComponent } from './fields/textarea/textarea.component';
import { FormErrorsService } from './form-errors/form-errors.service';
import { DynamicFormService } from './dynamic-form.service';
import { DynamicFormComponentMap } from './dynamic-form.models';
import { DynamicFormFacade } from './+state/dynamic-form.facade';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

// TODO -> Make the material components their own library

const ENTRY_COMPONENTS = [
  FormInputComponent,
  FormSelectComponent,
  FormToggleComponent,
  FormDatePickerComponent,
  FormTextAreaComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatFormFieldModule
  ],
  declarations: ENTRY_COMPONENTS,
  exports: ENTRY_COMPONENTS,
  entryComponents: ENTRY_COMPONENTS
})
export class DynamicFormMaterialComponentModule {}

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  declarations: [DynamicFormComponent, DynamicFormFieldDirective],
  exports: [DynamicFormComponent]
})
export class DynamicFormModule {}

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    DynamicFormMaterialComponentModule,
    StoreModule.forFeature('dynamicForm', reducer, {
      initialState: initialFormState
    }),
    EffectsModule.forFeature([DynamicFormsEffects])
  ],
  declarations: [FormErrorsComponent, FormErrorPipe],
  entryComponents: [FormErrorsComponent]
})
export class DataAccessDynamicFormModule {
  static forRoot(componentMap: DynamicFormComponentMap): ModuleWithProviders {
    return {
      ngModule: DataAccessDynamicFormModule,
      providers: [
        DynamicFormFacade,
        DynamicFormService,
        FormErrorsService,
        {
          provide: 'COMPONENT_MAP',
          useValue: componentMap
        }
      ]
    };
  }
}
