import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  DynamicFormFacade,
  TFormStructure,
  FormGroupTypes,
  FormFieldTypes,
  InputFieldTypes,
  FormArrayTypes,
} from '@ztp/common/dynamic-form';
import { CodeHighlightService } from '@ztp/demo/utils';
// import { IExample, DemoFacade } from '@ztp/demo/data-access';
import {
  markup,
  submitSyntax,
  moduleRegistry,
  setStructureMarkup,
} from './dynamic-form.code';
import { MatCheckboxChange } from '@angular/material/checkbox';

const SIMPLE_FORM: TFormStructure = [
  {
    displayName: 'Core Details',
    groupName: 'coreDetails',
    groupType: FormGroupTypes.Group,
    fields: [
      {
        type: FormFieldTypes.Input,
        name: 'firstName',
        label: 'First Name',
        validators: [Validators.required],
      },
      {
        type: FormFieldTypes.Input,
        name: 'surname',
        label: 'Surname',
        validators: [Validators.required],
      },
    ],
  },
];

const COMPLEX_FORM: TFormStructure = [
  {
    displayName: 'Core Details',
    groupName: 'coreDetails',
    groupType: FormGroupTypes.Group,
    fields: [
      {
        type: FormFieldTypes.Input,
        name: 'firstName',
        label: 'First Name',
        validators: [Validators.required],
      },
      {
        type: FormFieldTypes.Input,
        name: 'surname',
        label: 'Surname',
        validators: [Validators.required],
      },
      {
        type: FormFieldTypes.DatePicker,
        name: 'dob',
        label: 'Date Of Birth',
      },
      {
        type: FormFieldTypes.Input,
        inputType: InputFieldTypes.Email,
        name: 'email',
        label: 'Email Address',
        validators: [Validators.email],
      },
    ],
  },
  {
    displayName: 'Dependents',
    groupName: 'dependents',
    groupType: FormGroupTypes.Array,
    arrayType: FormArrayTypes.Group,
    classes: ['example-dependents'],
    number: 2,
    fields: [
      {
        type: FormFieldTypes.Input,
        name: 'name',
        label: 'Name',
      },
      {
        type: FormFieldTypes.DatePicker,
        name: 'dob',
        label: 'Date Of Birth',
      },
      {
        type: FormFieldTypes.CheckBox,
        name: 'dependent',
        label: 'Financially Dependent',
      },
    ],
  },
];

@Component({
  selector: 'ztp-example-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleDynamicFormComponent implements OnInit, AfterViewInit {
  readonly formName = 'dynamic-form-example';
  // example$: Observable<IExample | undefined>;
  submit$: Observable<any>;

  setStructureMarkup = setStructureMarkup;
  markup = markup;
  submitSyntax = submitSyntax;
  moduleRegistry = moduleRegistry;

  constructor(
    // private facade: DemoFacade,
    private formFacade: DynamicFormFacade,
    private highlight: CodeHighlightService
  ) {
    // this.example$ = this.facade.selectExampleById('1'); // hard coded because it is first and not coming from the db
    this.formFacade.createFormIfNotExist(this.formName);
    this.submit$ = this.formFacade.formSubmits$(this.formName);
  }

  ngOnInit() {
    this.formFacade.setFormConfig(this.formName, {
      classes: ['example-form'],
      structure: SIMPLE_FORM,
    });
  }

  ngAfterViewInit() {
    this.highlight.highlightAll();
  }

  complexForm(complex: boolean) {
    if (complex) {
      this.formFacade.setFormConfig(this.formName, { structure: COMPLEX_FORM });
    } else {
      this.formFacade.setFormConfig(this.formName, { structure: SIMPLE_FORM });
    }
  }

  toggleAnimations(change: MatCheckboxChange) {
    this.formFacade.setFormConfig(this.formName, {
      animations: change.checked,
    });
  }

  togglePagination(change: MatCheckboxChange) {
    this.formFacade.setFormConfig(this.formName, {
      paginateSections: change.checked,
    });
  }

  toggleDisabled(change: MatCheckboxChange) {
    this.formFacade.setFormConfig(this.formName, {
      enabled: !change.checked,
    });
  }
}
