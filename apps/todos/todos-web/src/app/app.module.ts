import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { CommonDataAccessModule } from '@ztp/common/data-access';
import { CommonAuthDataAccessModule } from '@ztp/common/auth/data-access';
import { SharedUsersDataAccessModule } from '@ztp/shared/users/data-access';
import { TodosFeatureShellModule } from '@ztp/todos/feature-shell';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AppEffects } from './+state/app.effects';
import { AppState, appReducerMap } from './+state/app.state';
import {
  CommonDynamicFormModule,
  defaultErrorMessages,
} from '@ztp/common/dynamic-form';
import {
  CommonDynamicFormMaterialComponentsModule,
  MATERIAL_COMPONENT_MAP,
} from '@ztp/common/dynamic-form-material-components';

export const APP_ERRORS = {
  ...defaultErrorMessages,
  missMatchPasswords: 'Passwords do not match',
  doesNotMeetRequirements: 'does note satisfy requirements',
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    StoreModule.forRoot<AppState>(appReducerMap),
    EffectsModule.forRoot([AppEffects]),
    StoreRouterConnectingModule.forRoot(),
    CommonDataAccessModule.forRoot(environment),
    CommonAuthDataAccessModule.forRoot({
      authServerUrl: environment.authServer,
    }),
    SharedUsersDataAccessModule.forRoot(),
    CommonDynamicFormModule.forRoot({
      components: MATERIAL_COMPONENT_MAP,
      errors: APP_ERRORS,
    }),
    CommonDynamicFormMaterialComponentsModule,
    AppRoutingModule,
    TodosFeatureShellModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
