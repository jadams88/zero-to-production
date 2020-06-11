import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SelectivePreloadingStrategyService } from '@ztp/common/router';

@NgModule({
  imports: [
    RouterModule.forRoot([], {
      initialNavigation: 'enabled',
      preloadingStrategy: SelectivePreloadingStrategyService,
      relativeLinkResolution: 'corrected',
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
