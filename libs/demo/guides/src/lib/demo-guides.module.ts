import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonUiLayoutsModule } from '@ztp/common/ui/layouts';
import { MarkedPipe } from '@ztp/demo/utils';
import { GuidesComponent } from './guides/guides.component';
import { DemoGuidesRoutingModule } from './demo-guides-routing.module';
import { MarkdownComponent } from './markdown/markdown.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  imports: [
    CommonModule,
    DemoGuidesRoutingModule,
    CommonUiLayoutsModule,
    MatTabsModule,
  ],
  declarations: [GuidesComponent, MarkedPipe, MarkdownComponent],
})
export class DemoGuidesModule {}
