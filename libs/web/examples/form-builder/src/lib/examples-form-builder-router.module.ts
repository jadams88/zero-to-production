import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExampleCreateFormComponent } from './create/create.component';
import { ExampleBuildFormComponent } from './build/build.component';
import { ExampleDisplayFormComponent } from './display/display.component';

const ROUTES: Routes = [
  { path: 'create', pathMatch: 'full', component: ExampleCreateFormComponent },
  {
    path: ':formId/edit',
    pathMatch: 'full',
    component: ExampleBuildFormComponent
  },
  {
    path: ':formId/display',
    pathMatch: 'full',
    component: ExampleDisplayFormComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'create'
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class ExamplesFormBuilderRouterModule {}
