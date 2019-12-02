import {
  FormFieldTypes,
  DynamicFormComponentMap
} from '@uqt/data-access/dynamic-form';
import { FormInputComponent } from './fields/input/input.component';
import { FormSelectComponent } from './fields/select/select.component';
import { FormToggleComponent } from './fields/toggle/toggle.components';
import { FormDatePickerComponent } from './fields/date-picker/date-picker.component';
import { FormTextAreaComponent } from './fields/textarea/textarea.component';

export const MATERIAL_COMPONENT_MAP: DynamicFormComponentMap = {
  [FormFieldTypes.Input]: FormInputComponent,
  [FormFieldTypes.TextArea]: FormTextAreaComponent,
  [FormFieldTypes.Select]: FormSelectComponent,
  [FormFieldTypes.Toggle]: FormToggleComponent,
  [FormFieldTypes.DatePicker]: FormDatePickerComponent
};
