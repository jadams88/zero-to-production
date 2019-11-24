import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExampleDynamicFormComponent } from './dynamic-form/dynamic-form.component';

const ROUTES: Routes = [
  { path: '', pathMatch: 'full', component: ExampleDynamicFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class ExamplesDynamicFormRouterModule {}
