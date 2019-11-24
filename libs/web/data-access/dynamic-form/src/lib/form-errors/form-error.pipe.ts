import { Pipe, PipeTransform } from '@angular/core';
import { FieldErrors } from './form-errors.component';

function splitCamelCaseAndUppercaseFirst(string: string): string {
  return (
    string.substr(0, 1).toUpperCase() +
    string.substr(1, string.length - 1).replace(/[A-Z]/g, c => ' ' + c)
  );
}

@Pipe({
  name: 'formError'
})
export class FormErrorPipe implements PipeTransform {
  transform(error: FieldErrors) {
    return `${splitCamelCaseAndUppercaseFirst(error.field)} ${
      error.errorMessage
    }`;
  }
}
