import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IExample } from '@ztp/demo/data-access';

@Component({
  selector: 'ztp-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  @Input() example: IExample;
}
