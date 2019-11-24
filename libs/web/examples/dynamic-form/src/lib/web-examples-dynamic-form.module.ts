import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamplesDynamicFormRouterModule } from './web-examples-dynamic-form-router.module';
import { ExampleDynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DataAccessDynamicFormModule } from '@ngw/data-access/dynamic-form';
import { CustomMaterialModule } from '@ngw/common/ui/custom-material';
import { CommonUiCardModule } from '@ngw/common/ui/card';
import { HighlightService } from './highlight.service';

const COMPONENTS = [ExampleDynamicFormComponent];

@NgModule({
  imports: [
    CommonModule,
    CustomMaterialModule,
    CommonUiCardModule,
    ExamplesDynamicFormRouterModule,
    DataAccessDynamicFormModule
  ],
  providers: [HighlightService],
  declarations: COMPONENTS
})
export class WebExamplesDynamicFormModule {}
