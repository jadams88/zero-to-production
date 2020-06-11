import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { CommonDataAccessModule } from '@ztp/common/data-access';
import {
  CommonAuthDataAccessModule,
  authProviderFactory,
  AuthService,
} from '@ztp/common/auth/data-access';
import { SharedUsersDataAccessModule } from '@ztp/shared/users/data-access';
import { StoreRouterConnectingModule, RouterState } from '@ngrx/router-store';
import { AppEffects } from './+state/app.effects';
import { AppState, appReducerMap } from './+state/app.state';
import { DemoFeatureShellModule } from '@ztp/demo/feature-shell';
import { CommonDynamicFormModule } from '@ztp/common/dynamic-form';
import { CommonDynamicFormMaterialComponentsModule } from '@ztp/common/dynamic-form-material-components';
import { APP_COMPONENTS, APP_ERRORS } from './app.dynamic-form';
import { themeProviderFactory, ThemeService } from '@ztp/common/utils/theme';
import { ServiceWorkerModule } from '@angular/service-worker';

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
      authServerUrl: environment.serverUrl,
    }),
    SharedUsersDataAccessModule.forRoot(),
    CommonDynamicFormMaterialComponentsModule,
    CommonDynamicFormModule.forRoot({
      components: APP_COMPONENTS,
      errors: APP_ERRORS,
    }),
    AppRoutingModule,
    DemoFeatureShellModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
  ],
  providers: [
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
