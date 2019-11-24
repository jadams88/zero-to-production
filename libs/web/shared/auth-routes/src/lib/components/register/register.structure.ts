import { Validators } from '@angular/forms';
import { CustomUsernameComponent } from '../custom-username/custom-username.components';
import { IFormGroup, TFormGroups } from '@ngw/types';
import { FormGroupTypes, FormFieldTypes } from '@ngw/enums';
import { UsernameAvailableValidator } from '../../validators/username-available.validator';
import { passwordValidator } from '../../validators/auth.validators';

const PASSWORD_GROUP: IFormGroup = {
  formGroup: 'password',
  groupType: FormGroupTypes.Group,
  fields: [
    {
      componentType: FormFieldTypes.Input,
      type: 'text',
      name: 'username',
      label: 'Username',
      autocomplete: 'username',
      validators: [Validators.required],
      asyncValidators: [UsernameAvailableValidator],
      customComponent: CustomUsernameComponent
    },
    {
      componentType: FormFieldTypes.Input,
      type: 'password',
      name: 'password',
      label: 'Select Password',
      autocomplete: 'new-password',
      validators: [Validators.required, passwordValidator]
    },
    {
      componentType: FormFieldTypes.Input,
      type: 'password',
      name: 'passwordCheck',
      label: 'Verify Password',
      autocomplete: 'new-password',
      validators: [Validators.required]
    }
  ]
};

// TODO -> Tie in the user registration settings to the theme service.
export const THEME_GROUP: IFormGroup = {
  formGroup: 'themeSettings',
  groupType: FormGroupTypes.Group,
  fields: [
    {
      componentType: FormFieldTypes.Toggle,
      name: 'darkMode',
      label: 'Dark Mode',
      initialValue: false,
      validators: [Validators.required]
    },
    {
      componentType: FormFieldTypes.Input,
      type: 'color',
      name: 'lightPrimary',
      label: 'Light Mode - Primary Colour',
      initialValue: '#7b1fa2',
      validators: [Validators.required]
    },
    {
      componentType: FormFieldTypes.Input,
      type: 'color',
      name: 'lightAccent',
      label: 'Light Mode - Accent Colour',
      initialValue: '#f0820f',
      validators: [Validators.required]
    },
    {
      componentType: FormFieldTypes.Input,
      type: 'color',
      name: 'darkPrimary',
      label: 'Dark Mode - Primary Colour',
      initialValue: '#20eff0',
      validators: [Validators.required]
    },
    {
      componentType: FormFieldTypes.Input,
      type: 'color',
      name: 'darkAccent',
      label: 'Dark Mode - Accent Colour',
      initialValue: '#d33685',
      validators: [Validators.required]
    }
  ]
};

export const DETAILS_GROUP: IFormGroup = {
  formGroup: 'details',
  groupType: FormGroupTypes.Group,
  fields: [
    {
      componentType: FormFieldTypes.Input,
      type: 'text',
      name: 'givenName',
      label: 'Given Name',
      autocomplete: 'given-name',
      validators: [Validators.required]
    },
    {
      componentType: FormFieldTypes.Input,
      type: 'text',
      name: 'surname',
      label: 'Surname',
      autocomplete: 'family-name',
      validators: [Validators.required]
    },
    {
      componentType: FormFieldTypes.Input,
      type: 'email',
      name: 'email',
      label: 'Email',
      autocomplete: 'email',
      validators: [Validators.required, Validators.email]
    },
    {
      componentType: FormFieldTypes.DatePicker,
      name: 'dateOfBirth',
      label: 'Date Of Birth',
      autocomplete: 'bday',
      validators: [Validators.required]
    }
  ]
};

export const REGISTER_STRUCTURE: TFormGroups = [
  DETAILS_GROUP,
  THEME_GROUP,
  PASSWORD_GROUP
];
