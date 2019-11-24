import {
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  FormGroup
} from '@angular/forms';
import { isPasswordAllowed } from '@ngw/utils/auth';

// A wrapper around the isPasswordAllowed method to create a form validator
export function passwordValidator(control: AbstractControl) {
  const allowed = isPasswordAllowed(control.value);
  return allowed ? null : { doesNotMeetRequirements: true };
}

// A form level validator to confirm the two form fields for creating a new password match
export function passwordMatchValidator(
  formGroupName: string,
  passwordControlName: string,
  checkPasswordControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // The controls will be part of a nested form group. Get the TL FG
    const group = control.get(formGroupName) as FormGroup;
    if (!group) return null;

    // Get the password and confirm password control
    const password = group.get(passwordControlName);
    const confirmPassword = group.get(checkPasswordControlName);

    if (!password || !confirmPassword) return null;

    // First check the the password has a value
    if (password.value) {
      // Enable the confirm password if it is disabled
      if (confirmPassword.disabled) {
        confirmPassword.enable();
      }

      // Check the confirm password matches and is valid
      if (confirmPassword.value && confirmPassword.value === password.value) {
        return null;
      } else {
        return { passwordsDoNotMatch: { value: true } };
      }
    } else {
      // Disable the confirm password if it is currently enabled
      if (!confirmPassword.disabled) {
        confirmPassword.disable();
      }
      return { passwordsDoNotMatch: { value: true } };
    }
  };
}
