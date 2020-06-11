import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoFeatureShellRoutingModule } from './demo-feature-shell-routing.module';
import { DemoFeatureShellComponent } from './demo-feature-shell.component';
import { CommonUiToolbarModule } from '@ztp/common/ui/toolbar';
import { CommonUiCardModule } from '@ztp/common/ui/card';
import { AnimateScrollEntryDirective } from '@ztp/demo/utils';
import { ExampleComponent } from './example/example.component';
import { DemoDataAccessModule } from '@ztp/demo/data-access';
import { DemoHomeComponent } from './home/home.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DemoHeaderComponent } from './header/header.component';
import { CommonUtilsNotificationModule } from '@ztp/common/utils/notifications';
import { MatButtonModule } from '@angular/material/button';
import { CommonRouterModule } from '@ztp/common/router';
import { CommonUiButtonsModule } from '@ztp/common/ui/buttons';

@NgModule({
  imports: [
    DemoDataAccessModule,
    DemoFeatureShellRoutingModule,
    CommonModule,
    CommonUiToolbarModule,
    CommonUiCardModule,
    CommonUiButtonsModule,
    CommonRouterModule,
    CommonUtilsNotificationModule,
    MatButtonModule,
    ScrollingModule,
  ],
  declarations: [
    DemoFeatureShellComponent,
    DemoHomeComponent,
    ExampleComponent,
    DemoHeaderComponent,
    AnimateScrollEntryDirective,
  ],
})
export class DemoFeatureShellModule {}
