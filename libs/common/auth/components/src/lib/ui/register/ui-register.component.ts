import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Optional,
  Inject,
} from '@angular/core';
import { LOGIN_PAGE } from '@ztp/common/auth/data-access';

@Component({
  selector: 'ztp-ui-register',
  templateUrl: './ui-register.component.html',
  styleUrls: ['./ui-register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiRegisterComponent {
  @Input() formName: string;
  constructor(@Optional() @Inject(LOGIN_PAGE) public loginPage: string) {
    this.loginPage = loginPage ? loginPage : '/login';
  }
}
