import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TField } from '@ngw/types';

@Component({
  selector: 'ngw-custom-username',
  templateUrl: './custom-username.component.html',
  styleUrls: ['./custom-username.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomUsernameComponent {
  @Input() field!: TField;
  @Input() group!: FormGroup;
}
