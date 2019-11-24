import { NgModule, ModuleWithProviders } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RouterEffects } from './+state/router.effects';

@NgModule({
  imports: [EffectsModule.forFeature([RouterEffects])]
})
export class RootDataAccessRouterModule {}

@NgModule()
export class DataAccessRouterModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RootDataAccessRouterModule
    };
  }
}
