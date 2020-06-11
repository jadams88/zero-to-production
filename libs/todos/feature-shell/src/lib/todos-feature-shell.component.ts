import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ISideNavRoute } from '@ztp/common/side-nav';

@Component({
  selector: 'todo-feature-shell',
  templateUrl: './todos-feature-shell.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFeatureShellComponent {
  /*
   * ZTP_AFTER_CLONE -> Use absolute routes when you build the Todo application by itself.
   * Currently a bug where if the relative route matches on a an empty path at the root
   * level the router serialization does not work correctly
   *
   * https://github.com/angular/angular/issues/13011
   */
  // DELETE
  routes: ISideNavRoute[] = [
    { path: 'home', icon: 'home', label: 'Home', aria: 'home' },
    { path: 'todos', icon: 'list', label: 'Todos', aria: 'todos' },
  ];

  // UNCOMMENT
  // routes: ISideNavRoute[] = [
  //   { path: '/home', icon: 'home', label: 'Home', aria: 'home' },
  //   { path: '/todos', icon: 'list', label: 'Todos', aria: 'todos' },
  // ];
}
