import { FormInputComponent } from './input/input.component';
import { FormSelectComponent } from './select/select.component';
import { FormToggleComponent } from './toggle/toggle.components';
import { FormDatePickerComponent } from './date-picker/date-picker.component';
import { FormTextAreaComponent } from './textarea/textarea.component';
import {
  FormFieldTypes,
  DynamicFormComponentMap
} from '../dynamic-form.models';

export const MATERIAL_COMPONENT_MAP: DynamicFormComponentMap = {
  [FormFieldTypes.Input]: FormInputComponent,
  [FormFieldTypes.TextArea]: FormTextAreaComponent,
  [FormFieldTypes.Select]: FormSelectComponent,
  [FormFieldTypes.Toggle]: FormToggleComponent,
  [FormFieldTypes.DatePicker]: FormDatePickerComponent
};
