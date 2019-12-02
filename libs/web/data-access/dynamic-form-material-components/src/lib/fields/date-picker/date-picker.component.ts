import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnDestroy
} from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import {
  MAT_DATE_FORMATS,
  NativeDateAdapter,
  DateAdapter
} from '@angular/material/core';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import {
  FormGroupTypes,
  TField,
  DynamicFormService
} from '@uqt/data-access/dynamic-form';

const APP_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

export class MyDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    }

    return date.toDateString();
  }

  parse(value: string): Date {
    const [day, month, year] = value.split(/\/|-/g);
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
}

/**
 * Dynamic form date picker component. Not as simple as the other input field because the value returned is a Date object.
 * The date object is not serializable, so need to create an internal form group and intercept the changing value and then
 * format, then set the stringified format of the top level group.
 *
 * The date format could be customized, or dynamic if you choose
 *
 * @export
 * @class DatePickerComponent
 */
@Component({
  selector: 'app-form-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormDatePickerComponent implements OnDestroy {
  private subscription: Subscription | undefined;

  dateField: TField | undefined;
  dateGroup: FormGroup;
  dateControl: FormControl | undefined;

  @Input() idx: number | undefined;
  @Input() type!: FormGroupTypes;

  @Input()
  set field(f: TField) {
    const ctrl = this.addControlToGroup(f);
    this.dateGroup.addControl(f.name, ctrl);
    this.dateField = f;
    this.listenToControlChange(ctrl);
  }

  @Input() group: FormGroup | undefined;

  constructor(private fb: FormBuilder, private service: DynamicFormService) {
    this.dateGroup = this.fb.group({});
  }

  addControlToGroup(f: TField) {
    return this.service.createControl(f);
  }

  /**
   * Listen to the change of the date adapter and set the value of the control on the top level form group
   *
   * @param {FormControl} control
   * @memberof DatePickerComponent
   */
  listenToControlChange(control: FormControl) {
    this.subscription = control.valueChanges
      .pipe(
        debounceTime(200),
        filter(val => val !== null)
      )
      .subscribe((date: Date) => {
        // There would be no chance for the group to no be set by the time
        // it is rendered on the DOM, but just in case.
        if (this.group !== undefined) {
          const groupCtrl = this.group.controls[
            (this.dateField as TField).name
          ];
          groupCtrl.setValue(this.formatDateToString(date));
          groupCtrl.markAsDirty();
        }
      });
  }

  /**
   * This could be made dynamic/changed to your needs
   *
   * @param {Date} date formControl value
   * @returns {string} formatted date string
   * @memberof DatePickerComponent
   */
  formatDateToString(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
