import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonDynamicFormModule } from '@ztp/common/dynamic-form';
import { CommonUiCardModule } from '@ztp/common/ui/card';
import { AuthComponent } from './auth.component';
import { UiLoginComponent } from './ui/login/ui-login.component';
import { UiRegisterComponent } from './ui/register/ui-register.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

const COMPONENTS = [
  AuthComponent,
  LoginComponent,
  UiLoginComponent,
  RegisterComponent,
  UiRegisterComponent,
];

@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CommonUiCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    CommonDynamicFormModule.forChild(),
  ],
  exports: COMPONENTS,
})
export class CommonAuthComponentsModule {}
