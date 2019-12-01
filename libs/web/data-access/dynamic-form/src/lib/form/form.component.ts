import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import {
  map,
  tap,
  debounceTime,
  switchMap,
  withLatestFrom,
  takeUntil
} from 'rxjs/operators';
import { expandFromCenter } from '@uqt/common/animations';
import { DynamicFormFacade } from '../+state/dynamic-form.facade';
import { IDynamicFormConfig } from '../+state/dynamic-form.reducer';
import { DynamicFormService } from '../dynamic-form.service';
import { FormErrorsService } from '../form-errors/form-errors.service';
import { FormErrorsComponent } from '../form-errors/form-errors.component';
import { FormGroupTypes, TFormGroups } from '../dynamic-form.models';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [expandFromCenter]
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  public form: FormGroup | undefined;
  private unsubscribe = new Subject<void>();

  config$: Observable<IDynamicFormConfig>;
  formIdx$: Observable<number>;
  structure$: Observable<TFormGroups>;

  constructor(
    private service: DynamicFormService,
    private formErrors: FormErrorsService,
    private facade: DynamicFormFacade
  ) {
    this.config$ = this.facade.config$;
    this.formIdx$ = this.facade.idx$;
    this.structure$ = this.facade.structure$;
  }

  ngOnInit() {
    this.facade.resetIndex();

    // TODO -> do we want default values, or reset the form with what is in the store?

    this.structure$
      .pipe(
        // Build the form
        map(str => this.service.formBuilder(str)),
        // Add the form validators
        withLatestFrom(this.facade.validators$),
        tap(([form, validators]) => form.setValidators(validators)),
        map(([form]) => form),
        // Set the internal form property with the new form
        tap(form => (this.form = form)),
        // Update the store with default values
        tap(({ value: data }) => this.facade.updateData({ data })),
        // Switch to the observable of the change in form values
        switchMap(form =>
          form.valueChanges.pipe(
            // Wait 100ms before updating the store
            // NOTE: This needs to be relatively fast
            // Think of pushing enter after entering a well know password, store may have not
            // updated in time
            debounceTime(100)
          )
        ),
        takeUntil(this.unsubscribe)
      )
      .subscribe(data => {
        // Update the store
        this.facade.updateData({ data });
      });

    /**
     * The set data method does not update the store, it resets the form with the data
     *
     * When the form resets, it will emit a value changed event and subsequently will update the store
     * @param data
     */
    this.facade.setData$.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      (this.form as FormGroup).reset(data);
    });
  }

  onSubmit(form: FormGroup) {
    const { valid } = form;
    if (valid) {
      this.facade.clearErrors();
      this.facade.submitForm();
    } else {
      // collect all form errors
      const errors = this.service.getAllFormErrors(form);
      this.facade.setErrors({ errors });
      this.createFormErrors();
    }
  }

  getFormGroup(formGroup: FormGroup, name: string): FormGroup | FormArray {
    return formGroup.get(name) as FormGroup | FormArray;
  }

  isGroupFields(type: FormGroupTypes): boolean {
    return Boolean(type === FormGroupTypes.Group);
  }

  nextSection() {
    this.facade.nextSection();
  }

  backASection() {
    this.facade.backASection();
  }

  createFormErrors() {
    const { overlayRef, componentRef } = this.formErrors.createOverlay(
      FormErrorsComponent
    );

    componentRef.instance.dismiss.subscribe(() => {
      overlayRef.dispose();
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
