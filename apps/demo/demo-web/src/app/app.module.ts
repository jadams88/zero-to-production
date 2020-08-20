import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
  CommonDataAccessModule,
  ApiService,
  GraphQLService,
} from '@ztp/common/data-access';
import {
  CommonAuthDataAccessModule,
  authProviderFactory,
  AuthService,
  LOGIN_PAGE,
  REGISTER_PAGE,
  LOGIN_REDIRECT,
} from '@ztp/common/auth/data-access';
import { SharedUsersDataAccessModule } from '@ztp/shared/users/data-access';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AppEffects } from './+state/app.effects';
import { AppState, appReducerMap } from './+state/app.state';
import { DemoFeatureShellModule } from '@ztp/demo/feature-shell';
import {
  CommonDynamicFormModule,
  defaultErrorMessages,
} from '@ztp/common/dynamic-form';
import { themeProviderFactory, ThemeService } from '@ztp/common/utils/theme';
import { ServiceWorkerModule } from '@angular/service-worker';
import { DemoApiService, DemoGraphQLService } from '@ztp/demo/data-access';
import {
  CommonDynamicFormMaterialComponentsModule,
  MATERIAL_COMPONENT_MAP,
} from '@ztp/common/dynamic-form-material-components';
import { DemoThemeService } from '@ztp/demo/utils';

export const APP_ERRORS = {
  ...defaultErrorMessages,
  missMatchPasswords: 'Passwords do not match',
  doesNotMeetRequirements: 'does note satisfy requirements',
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'zeroToProduction' }),
    BrowserAnimationsModule,
    StoreModule.forRoot<AppState>(appReducerMap),
    EffectsModule.forRoot([AppEffects]),
    StoreRouterConnectingModule.forRoot(),
    CommonDataAccessModule.forRoot(environment),
    CommonAuthDataAccessModule.forRoot({
      authServerUrl: environment.authServer,
    }),
    SharedUsersDataAccessModule.forRoot(),
    CommonDynamicFormMaterialComponentsModule,
    CommonDynamicFormModule.forRoot({
      components: MATERIAL_COMPONENT_MAP,
      errors: APP_ERRORS,
    }),
    AppRoutingModule,
    DemoFeatureShellModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
  ],
  providers: [
    { provide: LOGIN_PAGE, useValue: '/examples/todos/login' },
    { provide: REGISTER_PAGE, useValue: '/examples/todos/register' },
    { provide: LOGIN_REDIRECT, useValue: '/examples/todos/home' },
    { provide: ThemeService, useExisting: DemoThemeService },
    { provide: ApiService, useExisting: DemoApiService },
    { provide: GraphQLService, useExisting: DemoGraphQLService },
    {
      provide: APP_INITIALIZER,
      useFactory: themeProviderFactory,
      multi: true,
      deps: [ThemeService],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: authProviderFactory,
      multi: true,
      deps: [AuthService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
