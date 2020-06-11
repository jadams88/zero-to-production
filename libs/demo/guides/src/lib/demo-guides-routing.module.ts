import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuidesComponent } from './guides/guides.component';
import { MarkdownComponent } from './markdown/markdown.component';
import { IGuide, GUIDES } from './guides';

function createGuideRoutes(guides: IGuide[]): Routes {
  return guides.map((guide) => ({
    path: guide.path,
    component: MarkdownComponent,
    pathMatch: 'full',
    data: {
      guide: guide.guide,
      description: guide.description,
    },
  }));
}

const ROUTES: Routes = [
  {
    path: '',
    component: GuidesComponent,
    children: [
      ...createGuideRoutes(GUIDES),
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'getting-started',
      },
      {
        path: '**',
        redirectTo: '/',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class DemoGuidesRoutingModule {}
