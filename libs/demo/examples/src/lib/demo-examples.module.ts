import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExampleComponent } from './example/example.component';
import { CommonUiLayoutsModule } from '@ztp/common/ui/layouts';
import { DemoExamplesRouterModule } from './demo-examples-router.module';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    DemoExamplesRouterModule,
    CommonUiLayoutsModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  declarations: [ExampleComponent],
})
export class DemoExamplesModule {}
