import {
  Component,
  ChangeDetectionStrategy,
  Input,
  HostBinding,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Observable, Subject } from 'rxjs';

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { TField } from '@ngw/types';
import { AvailableStatus } from '@ngw/enums';
import { AuthFacade } from '@ngw/data-access/auth';

@Component({
  selector: 'ngw-custom-username-input',
  templateUrl: './custom-username-input.component.html',
  styleUrls: ['./custom-username-input.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: CustomUsernameInputComponent }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomUsernameInputComponent implements OnDestroy {
  usernameAvailability$: Observable<AvailableStatus | null>;

  @Input() group!: FormGroup;
  @Input() field!: TField;

  stateChanges = new Subject<void>();
  focused = false;
  private _required = false;
  // private _disabled = false;
  controlType = 'register-username-input';
  @HostBinding('attr.aria-describedby') describedBy = '';

  get empty() {
    if (this.group) {
      const { username } = this.group.value;
      return !username;
    } else {
      return false;
    }
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  // @Input()
  // get disabled(): boolean {
  //   return this._disabled;
  // }

  // set disabled(value: boolean) {
  //   this._disabled = coerceBooleanProperty(value);
  //   this._disabled ? this.group.disable() : this.group.enable();
  //   this.stateChanges.next();
  // }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      (this.elRef.nativeElement.querySelector(
        'input'
      ) as HTMLInputElement).focus();
    }
  }

  constructor(
    private facade: AuthFacade,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>
  ) {
    this.usernameAvailability$ = this.facade.usernameAvailability$;

    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  // writeValue(obj: any): void {
  //   this.group.controls.username.patchValue(obj);
  // }

  // registerOnChange(fn: any): void {}
  // registerOnTouched(fn: any): void {}

  // setDisabledState(isDisabled: boolean) {
  //   // this._disabled = isDisabled;
  // }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }
}
