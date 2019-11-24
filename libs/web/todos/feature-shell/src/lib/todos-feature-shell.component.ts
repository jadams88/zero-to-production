import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { SideNavFacade } from '@ngw/common/ui/side-nav';
import { ISideNaveRoute } from '@ngw/types';

@Component({
  selector: 'todo-feature-shell',
  templateUrl: './todos-feature-shell.component.html',
  styleUrls: ['./todos-feature-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoFeatureShellComponent implements OnInit {
  constructor(private facade: SideNavFacade) {}

  routes: ISideNaveRoute[] = [
    { path: 'home', icon: 'home', label: 'Home' },
    { path: 'todos', icon: 'list', label: 'Todos' }
  ];

  /*
   * TODO -> Use these absolute routes when you build the todo application by itself.
   * Currently a bug where if the relative route matches on a an empty path
   * the router serialization does not work correctly
   *
   * https://github.com/angular/angular/issues/13011
   */

  // routes: ISideNaveRoute[] = [
  //   { path: '/home', icon: 'home', label: 'Home' },
  //   { path: '/todos', icon: 'list', label: 'Todos' }
  // ];

  ngOnInit() {
    this.facade.setNavRoutes(this.routes);
  }

  navToggle() {
    this.facade.toggle();
  }
}
