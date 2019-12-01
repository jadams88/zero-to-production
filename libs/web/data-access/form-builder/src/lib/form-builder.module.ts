import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormModule } from '@uqt/data-access/dynamic-form';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { CustomMaterialModule } from '@uqt/common/ui/custom-material';
import { StoreModule } from '@ngrx/store';
import { FormsEntityState, reducer } from './+state/form-builder.reducer';
import { EffectsModule } from '@ngrx/effects';
import { FormEffects } from './+state/form-builder.effects';
import { CreateFormComponent } from './create-form/create-form.component';
import { UiFormBuilderComponent } from './ui-form-builder/ui-form-builder.component';
import { ReactiveFormsModule } from '@angular/forms';

const COMPONENTS = [
  FormBuilderComponent,
  CreateFormComponent,
  UiFormBuilderComponent
];

@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormModule,
    CustomMaterialModule,
    StoreModule.forFeature<FormsEntityState>('formsState', reducer),
    EffectsModule.forFeature([FormEffects])
  ],
  exports: COMPONENTS
})
export class DataAccessFormBuilderModule {}
