import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'ngw-ui-register',
  templateUrl: './ui-register.component.html',
  styleUrls: ['./ui-register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UiRegisterComponent {}
