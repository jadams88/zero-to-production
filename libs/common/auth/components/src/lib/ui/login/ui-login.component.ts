import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Optional,
  Inject,
} from '@angular/core';
import { REGISTER_PAGE } from '@ztp/common/auth/data-access';

@Component({
  selector: 'ztp-ui-login',
  templateUrl: './ui-login.component.html',
  styleUrls: ['./ui-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiLoginComponent {
  @Input() formName: string;
  constructor(@Optional() @Inject(REGISTER_PAGE) public registerPage: string) {
    this.registerPage = registerPage ? registerPage : '/register';
  }
}
