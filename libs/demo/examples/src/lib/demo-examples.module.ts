import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExampleComponent } from './example/example.component';
import { CommonUiLayoutsModule } from '@ztp/common/ui/layouts';
import { DemoExamplesRouterModule } from './demo-examples-router.module';

@NgModule({
  imports: [CommonModule, DemoExamplesRouterModule, CommonUiLayoutsModule],
  declarations: [ExampleComponent],
})
export class DemoExamplesModule {}
