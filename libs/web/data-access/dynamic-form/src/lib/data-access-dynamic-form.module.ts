import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DynamicFormComponent } from './form/form.component';
import { DynamicFormFieldDirective } from './form/form-field.directive';
import { DynamicFormsEffects } from './+state/dynamic-form.effects';
import { reducer, initialFormState } from './+state/dynamic-form.reducer';
import { FormErrorsComponent } from './form-errors/form-errors.component';
import { DynamicFormConfig, DefaultErrorMessages } from './dynamic-form.models';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  declarations: [DynamicFormComponent, DynamicFormFieldDirective],
  exports: [DynamicFormComponent]
})
export class DynamicFormModule {
  static forRoot({
    componentMap,
    errors
  }: DynamicFormConfig): ModuleWithProviders<RootDataAccessDynamicFormModule> {
    return {
      ngModule: RootDataAccessDynamicFormModule,
      providers: [
        {
          provide: 'DYNAMIC_FORM_COMPONENT_MAP',
          useValue: componentMap
        },
        // If no errors are provided, supply the default error messages
        {
          provide: 'DYNAMIC_FORM_ERRORS',
          useValue: errors ? errors : DefaultErrorMessages
        }
      ]
    };
  }

  static forChild(): ModuleWithProviders<DynamicFormModule> {
    return {
      ngModule: DynamicFormModule
    };
  }
}

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('dynamicForm', reducer, {
      initialState: initialFormState
    }),
    EffectsModule.forFeature([DynamicFormsEffects])
  ],
  declarations: [FormErrorsComponent],
  entryComponents: [FormErrorsComponent],
  exports: [DynamicFormModule]
})
export class RootDataAccessDynamicFormModule {}
