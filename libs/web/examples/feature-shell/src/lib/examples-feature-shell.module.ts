import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamplesFeatureShellRoutingModule } from './examples-feature-shell-routing.module';
import { ExamplesFeatureShellComponent } from './examples-feature-shell.component';
import { CommonUiToolbarModule } from '@ngw/common/ui/toolbar';
import { CommonUiCardModule } from '@ngw/common/ui/card';
import { ExamplesComponent } from './examples/examples.component';
import { CustomMaterialModule } from '@ngw/common/ui/custom-material';
import { ExamplesDataAccessModule } from '@ngw/examples/data-access';
import { ExampleDetailComponent } from './example-detail/example-detail.component';
import { CommonUiLayoutsModule } from '@ngw/common/ui/layouts';

const COMPONENTS = [
  ExamplesFeatureShellComponent,
  ExamplesComponent,
  ExampleDetailComponent
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CommonUiLayoutsModule,
    CustomMaterialModule,
    CommonUiToolbarModule,
    CommonUiCardModule,
    ExamplesDataAccessModule,
    ExamplesFeatureShellRoutingModule
  ],
  declarations: COMPONENTS
})
export class ExamplesFeatureShellModule {}
