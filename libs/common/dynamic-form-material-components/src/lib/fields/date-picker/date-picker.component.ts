import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  Injectable,
  OnInit,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  MAT_DATE_FORMATS,
  NativeDateAdapter,
  DateAdapter,
} from '@angular/material/core';
import { Subscription } from 'rxjs';
import { debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';
import format from 'date-fns/format';
import { FormGroupTypes, IDatePickerField } from '@ztp/common/dynamic-form';
import {
  MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';

function isValidDate(date: Date): Boolean {
  return date instanceof Date && !isNaN(date as any);
}

const APP_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

// TODO -> i18n localTimeformat
// https://angular.io/guide/i18n#i18n-pipes
@Injectable()
export class MyDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    // if (displayFormat === 'input') {
    // const day = date.getDate();
    // const month = date.getMonth() + 1;
    // const year = date.getFullYear();

    // return `${day}-${month}-${year}`;
    // return date.toLocaleDateString();
    // }

    return format(date, 'dd/MM/yyyy');
  }

  parse(value: string): Date | null {
    const [day, month, year] = value.split(/\/|-/g);
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (isValidDate(date)) {
      return date;
    } else {
      return null;
    }
  }
}

/**
 * Dynamic form date picker component. Not as simple as the other input field because the value returned is a Date object.
 * The date object is not serializable, so need to create an internal form control and intercept the changing value and then
 * format, then set the stringified format of the top level group.
 *
 * The date format could be customized, or dynamic if you choose
 *
 * @export
 * @class DatePickerComponent
 */
@Component({
  selector: 'ztp-form-date-picker',
  templateUrl: './date-picker.component.html',
  styles: [
    `
      :host {
        display: block;
      }
      .mat-form-field {
        width: 100%;
      }
    `,
  ],
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useValue: MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDatePickerComponent implements OnInit, OnDestroy {
  date = new FormControl();
  private _group: FormGroup | undefined;
  private sub: Subscription = new Subscription();

  @Input() idx: number; // Only accessed if it is a FormArrayGroup
  @Input() type: FormGroupTypes;
  @Input() field: IDatePickerField;

  @Input()
  set group(fg: FormGroup | undefined) {
    if (fg) {
      const controlValue = fg.controls[this.field.name].value;
      this.date.patchValue(controlValue);

      if (fg.disabled) this.date.disable();
      this.listenToStatusChanges(fg);
    }

    this._group = fg;
  }

  /**
   * Listen to the change of the date adapter and set the value of
   * the control on the top level form group
   */
  ngOnInit() {
    this.sub.add(
      this.date.valueChanges
        .pipe(
          debounceTime(200),
          filter((val) => val !== null),
          distinctUntilChanged()
        )
        .subscribe((date: Date) => {
          // There would be no chance for the group to no be set by the time
          // it is rendered on the DOM, but just in case.
          if (this._group !== undefined && isValidDate(date)) {
            const groupCtrl = this._group.controls[this.field.name];
            groupCtrl.setValue(this.formatDateToString(date));
            groupCtrl.markAsDirty();
          }
        })
    );
  }

  listenToStatusChanges(formGroup: FormGroup) {
    this.sub.add(
      formGroup.statusChanges.subscribe((status) => {
        if (status === 'DISABLED') {
          this.date.disable();
        } else if (this.date.disabled) {
          this.date.enable();
        }
      })
    );
  }

  formatDateToString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
