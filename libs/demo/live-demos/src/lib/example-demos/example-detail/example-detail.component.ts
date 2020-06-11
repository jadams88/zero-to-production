import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ComponentFactory,
} from '@angular/core';
import { IExample } from '@ztp/demo/data-access';

@Component({
  selector: 'ztp-example-detail',
  templateUrl: './example-detail.component.html',
  styleUrls: ['./example-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleDetailComponent {
  @Input() example: IExample | null;
  @Input() factory: ComponentFactory<any> | null | undefined;
}
