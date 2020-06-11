import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExampleFormBuilderOverviewComponent } from './overview/overview.component';

const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ExampleFormBuilderOverviewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class TempRoutingModule {}
