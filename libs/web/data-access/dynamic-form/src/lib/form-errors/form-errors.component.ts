import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import mapR from 'ramda/es/map';
import { timer, Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { formErrorsAnimations } from './form-errors.animations';
import { DynamicFormFacade } from '../+state/dynamic-form.facade';

// TODO a11y Announcer

// TODO All form errors

export enum ErrorMessages {
  required = 'is required',
  email = 'is not a valid email'
}

export interface FieldErrors {
  field: string;
  errorMessage: ErrorMessages;
}

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

  errors$: Observable<FieldErrors[]>;

  constructor(private facade: DynamicFormFacade) {
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
    const keys = Object.keys(errors);
    const fieldErrors: FieldErrors[] = [];

    for (let i = 0; i < keys.length; i++) {
      const errorsKeys = Object.keys(errors[keys[i]]);
      const nestedErrors = reduceErrorKeysToMessages(keys[i], errorsKeys);
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
  field: string,
  keys: string[]
): FieldErrors[] {
  return mapR(
    key => ({
      field,
      errorMessage: ErrorMessages[key as keyof typeof ErrorMessages]
    }),
    keys
  );
}
