import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { FrontendUtilsStorageModule } from '@ngw/utils/storage';
import { CommonNotificationModule } from '@ngw/utils/notifications';

import { AuthEffects } from './+state/auth.effects';
import { AuthFacade } from './+state/auth.facade';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { LoggedInGuard } from './guards/logged-in.guard';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { JWTAuthService } from './services/jwt-auth.service';
import { reducer, AuthState, initialState } from './+state/auth.reducer';

@NgModule({
  imports: [
    CommonNotificationModule,
    FrontendUtilsStorageModule,
    StoreModule.forFeature<AuthState>('authState', reducer, { initialState }),
    EffectsModule.forFeature([AuthEffects])
  ]
})
export class RootDataAccessAuthModule {}

export class DataAccessAuthModule {
  static forRoot(): ModuleWithProviders<DataAccessAuthModule> {
    return {
      ngModule: RootDataAccessAuthModule,
      providers: [
        AuthFacade,
        AuthService,
        JWTAuthService,
        AuthGuard,
        LoggedInGuard,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    };
  }
}
