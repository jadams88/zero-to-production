import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ztp-example-todos',
  templateUrl: './example-todos.component.html',
  styleUrls: ['./example-todos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleTodosComponent {
  show = false;
  constructor(private router: Router) {}

  showTodos() {
    this.show = true;
    this.router.navigate(['examples', 'secure']);
  }
}
