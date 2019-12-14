import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { DataAccessApiModule } from '@uqt/data-access/api';
import { DataAccessAuthModule } from '@uqt/data-access/auth';
import { DataAccessUsersModule } from '@uqt/data-access/users';
import { DataAccessRouterModule } from '@uqt/data-access/router';
import { StoreRouterConnectingModule, RouterState } from '@ngrx/router-store';
import { AppEffects } from './+state/app.effects';
import { AppState, appReducerMap } from './+state/app.state';
import { ExamplesFeatureShellModule } from '@uqt/examples';
import {
  DynamicFormModule,
  defaultErrorMessages
} from '@uqt/data-access/dynamic-form';
import {
  DynamicFormMaterialComponentsModule,
  MATERIAL_COMPONENT_MAP
} from '@uqt/common/dynamic-form-material-components';
import { CustomUsernameComponent } from '@uqt/web/common/ui/auth';

const components = {
  ...MATERIAL_COMPONENT_MAP,
  USERNAME: CustomUsernameComponent
};

const errors = {
  ...defaultErrorMessages,
  missMatchPasswords: 'Passwords do not match',
  doesNotMeetRequirements: 'does note satisfy requirements'
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    StoreModule.forRoot<AppState>(appReducerMap, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true
      }
    }),
    EffectsModule.forRoot([AppEffects]),
    StoreRouterConnectingModule.forRoot({
      routerState: RouterState.Minimal
    }),
    DataAccessApiModule.forRoot(environment),
    DataAccessAuthModule.forRoot(),
    DataAccessUsersModule.forRoot(),
    DataAccessRouterModule.forRoot(),
    DynamicFormMaterialComponentsModule,
    DynamicFormModule.forRoot({
      components,
      errors
    }),
    AppRoutingModule.forRoot(),
    ExamplesFeatureShellModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
