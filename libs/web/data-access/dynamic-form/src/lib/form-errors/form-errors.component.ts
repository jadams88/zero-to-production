import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Output,
  EventEmitter,
  Inject
} from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import mapR from 'ramda/es/map';
import { timer, Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { formErrorsAnimations } from './form-errors.animations';
import { DynamicFormFacade } from '../+state/dynamic-form.facade';
import { DynamicFormErrorsMap, FormErrorTypes } from './form-errors';

// TODO a11y Announcer

@Component({
  selector: 'app-form-errors',
  templateUrl: './form-errors.component.html',
  styleUrls: ['./form-errors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [formErrorsAnimations]
})
export class FormErrorsComponent implements OnDestroy {
  private autoClose = 5000; // ms until close
  private unsubscribe = new Subject();

  @Output() dismiss = new EventEmitter<void>();

  errors$: Observable<string[]>;

  constructor(
    @Inject('DYNAMIC_FORM_ERRORS')
    private formErrors: DynamicFormErrorsMap,
    private facade: DynamicFormFacade
  ) {
    timer(this.autoClose)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.dismiss.emit();
      });

    this.errors$ = (this.facade.errors$ as Observable<ValidationErrors>).pipe(
      map(errors => this.createFieldErrors(errors)),
      takeUntil(this.unsubscribe)
    );
  }

  createFieldErrors(errors: ValidationErrors) {
    const topLevelKeys = Object.keys(errors);
    const fieldErrors: string[] = [];

    for (let i = 0; i < topLevelKeys.length; i++) {
      const errorsKeys = Object.keys(errors[topLevelKeys[i]]);
      const nestedErrors = reduceErrorKeysToMessages(
        this.formErrors,
        topLevelKeys[i],
        errorsKeys
      );
      fieldErrors.push(...nestedErrors);
    }

    return fieldErrors;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}

function reduceErrorKeysToMessages(
  formErrors: DynamicFormErrorsMap,
  field: string,
  keys: string[]
): string[] {
  return mapR(
    key =>
      `${splitCamelCaseAndUppercaseFirst(field)} ${
        formErrors[key as keyof typeof FormErrorTypes]
      }`,
    keys
  );
}

function splitCamelCaseAndUppercaseFirst(string: string): string {
  return (
    string.substr(0, 1).toUpperCase() +
    string.substr(1, string.length - 1).replace(/[A-Z]/g, c => ' ' + c)
  );
}
