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
  routes: ISideNavRoute[] = [
    { path: 'home', icon: 'home', label: 'Home', aria: 'home' },
    { path: 'todos', icon: 'list', label: 'Todos', aria: 'todos' },
  ];
}
