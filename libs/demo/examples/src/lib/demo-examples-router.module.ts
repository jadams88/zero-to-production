import { NgModule } from '@angular/core';
import {
  RouterModule,
  Routes,
  UrlSegment,
  UrlMatchResult,
  Route,
  UrlSegmentGroup,
  UrlMatcher,
} from '@angular/router';
import { ExampleComponent } from './example/example.component';

// TODO -> remove the 'as any' from type null after angular v10
// https://github.com/angular/angular/pull/31098

function customUrlMatcher(url: string): UrlMatcher {
  return (segments: UrlSegment[], group: UrlSegmentGroup, route: Route) => {
    // const [{ path = '' } = {}] = segments;
    console.log(segments);
    console.log(group);
    console.log(route);
    // console.log(path);
    console.log(url);

    const path = '1';
    if (path === url) {
      return {
        consumed: [segments[0]],
      } as UrlMatchResult;
    } else {
      return null as any;
    }
  };
}

const ROUTES: Routes = [
  {
    path: ':example',
    component: ExampleComponent,
    children: [
      {
        matcher: customUrlMatcher('dynamic-form'),
        loadChildren: () =>
          import('@ztp/demo/dynamic-form').then((m) => m.DemoDynamicFormModule),
        data: { preload: true },
      },
      {
        path: 'form-builder',
        loadChildren: () =>
          import('@ztp/demo/form-builder').then((m) => m.DemoFormBuilderModule),
      },
      {
        path: 'theming',
        loadChildren: () =>
          import('@ztp/demo/theming').then((m) => m.DemoThemingModule),
      },
      {
        path: 'lazy-scrolling',
        loadChildren: () =>
          import('@ztp/demo/lazy-load-scrolling').then(
            (m) => m.DemoLazyLoadScrollingModule
          ),
      },
      {
        path: 'todos',
        loadChildren: () =>
          import('@ztp/demo/secure-todos').then((m) => m.DemoSecureTodosModule),
      },
      {
        path: 'make-it-your-own',
        loadChildren: () =>
          import('@ztp/demo/make-it-your-own').then(
            (m) => m.DemoStartYourOwnModule
          ),
      },
      // {
      //   path: '',
      //   pathMatch: 'full',
      //   redirectTo: 'dynamic-form',
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class DemoExamplesRouterModule {}
