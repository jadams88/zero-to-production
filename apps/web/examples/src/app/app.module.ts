import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { DataAccessApiModule } from '@ngw/data-access/api';
import { DataAccessAuthModule } from '@ngw/data-access/auth';
import { DataAccessUsersModule } from '@ngw/data-access/users';
import { DataAccessRouterModule } from '@ngw/data-access/router';
import { StoreRouterConnectingModule, RouterState } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppEffects } from './+state/app.effects';
import { AppState, appReducerMap } from './+state/app.state';

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
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    DataAccessApiModule.forRoot(environment),
    DataAccessAuthModule.forRoot(),
    DataAccessUsersModule.forRoot(),
    DataAccessRouterModule.forRoot(),
    AppRoutingModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
