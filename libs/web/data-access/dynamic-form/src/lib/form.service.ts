import { Injectable, Injector } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  FormControl,
  AsyncValidatorFn,
  AsyncValidator,
  Validators,
  FormBuilder
} from '@angular/forms';
import { TField, TFormGroups } from '@ngw/types';
import { FormGroupTypes, FormArrayTypes } from '@ngw/enums';

@Injectable({ providedIn: 'root' })
export class DynamicFormService {
  //
  constructor(private injector: Injector, private fb: FormBuilder) {}

  formBuilder(structure: TFormGroups): FormGroup {
    // Top level group
    const form = this.fb.group({});

    // For each top level group
    structure.forEach(group => {
      if (group.groupType === FormGroupTypes.Group) {
        // Create a form group,
        const fg = this.fb.group({});
        // and add all nested groups to the form
        group.fields.forEach(field => {
          const control = this.createControl(field);
          fg.addControl(field.name, control);
        });
        // then add the nested form group to the top level group
        form.addControl(group.formGroup, fg);
      } else if (group.groupType === FormGroupTypes.Array) {
        const fa = this.fb.array([]);

        if (group.initialNumber !== undefined) {
          for (let i = 0; i < (group.initialNumber as number); i++) {
            if (group.arrayType === FormArrayTypes.Field) {
              // and add all nested groups to the form

              const control = this.createControl(group.field);
              // Add the form field to the array
              fa.push(control);
            } else {
              // Creat form group
              const fg = this.fb.group({});
              // and add all nested groups to the form
              group.fields.forEach(field => {
                const control = this.createControl(field);
                fg.addControl(field.name, control);
              });

              // Add the form group to the array
              fa.push(fg);
            }
          }
        }

        // then add the nested form group to the top level group
        form.addControl(group.formGroup, fa);
      }
    });

    return form;
  }

  createControl(field: TField): FormControl {
    const asyncValidators: AsyncValidatorFn[] = [];
    if (field.asyncValidators) {
      field.asyncValidators.forEach(di => {
        const validator = this.injector.get<AsyncValidator>(di);
        asyncValidators.push(validator.validate.bind(validator));
      });
    }

    const validators = Validators.compose(
      field.validators ? field.validators : []
    );

    return this.fb.control(field.initialValue, validators, asyncValidators);
  }

  getAllFormErrors(form: FormGroup): ValidationErrors {
    const errors: ValidationErrors = {};
    if (form.errors) {
      errors['form'] = form.errors;
    }
    return { ...errors, ...this.getControlErrors(form) };
  }

  getControlErrors(form: FormGroup): ValidationErrors {
    // Get a list of all the control names
    const formControls = Object.keys(form.controls);
    /*
     * Iterate over them, each time checking if it is a form control or group
     * if it is a group, then recursively collect the errors
     */
    return formControls.reduce((errors, controlName) => {
      const control = form.controls[controlName];

      if (this.isControlAFormGroup(control)) {
        // A form group may have a top level for error
        if (this.controlHasErrors(control)) {
          errors[controlName] = control.errors as ValidationErrors;
        }

        return {
          ...errors,
          ...this.getControlErrors(control as FormGroup)
        };
      } else {
        // it is a control
        if (this.controlHasErrors(control)) {
          errors[controlName] = control.errors as ValidationErrors;
        }
        return errors;
      }
    }, {} as ValidationErrors);
  }

  isControlAFormGroup(control: AbstractControl | FormGroup): boolean {
    return (control as FormGroup).controls !== undefined;
  }

  controlHasErrors(control: AbstractControl | FormGroup): boolean {
    return control.errors !== null;
  }
}
