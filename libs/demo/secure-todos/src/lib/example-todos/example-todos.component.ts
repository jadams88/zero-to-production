import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ztp-example-todos',
  templateUrl: './example-todos.component.html',
  styleUrls: ['./example-todos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleTodosComponent {}
