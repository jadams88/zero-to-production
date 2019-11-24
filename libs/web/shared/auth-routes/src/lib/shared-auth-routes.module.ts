import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './components/auth.component';
import { LoginComponent } from './components/login/login.component';
import { UiLoginComponent } from './components/login/ui/ui-login.component';
import { UiRegisterComponent } from './components/register/ui/ui-register.component';
import { CustomUsernameComponent } from './components/custom-username/custom-username.components';
import { CustomUsernameInputComponent } from './components/custom-username/custom-username-input.component';
import { RegisterComponent } from './components/register/register.component';
import { RouterModule } from '@angular/router';
import { CustomMaterialModule } from '@ngw/common/ui/custom-material';
import { ReactiveFormsModule } from '@angular/forms';
import { UsernameAvailableValidator } from './validators/username-available.validator';
import { DataAccessDynamicFormModule } from '@ngw/data-access/dynamic-form';

const COMPONENTS = [
  AuthComponent,
  LoginComponent,
  UiLoginComponent,
  RegisterComponent,
  UiRegisterComponent,
  CustomUsernameComponent,
  CustomUsernameInputComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CustomMaterialModule,
    DataAccessDynamicFormModule
  ],
  declarations: COMPONENTS,
  providers: [UsernameAvailableValidator],
  exports: COMPONENTS,
  entryComponents: [CustomUsernameComponent]
})
export class SharedAuthRoutesModule {}
