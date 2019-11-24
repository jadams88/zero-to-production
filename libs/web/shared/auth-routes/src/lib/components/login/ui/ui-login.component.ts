import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

/**
 * The login page is themed by the light/dark theme, hence
 * ViewEncapsulation is set to None as the theme class
 * is at the router level
 */
@Component({
  selector: 'ngw-ui-login',
  templateUrl: './ui-login.component.html',
  styleUrls: ['./ui-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UiLoginComponent {}
