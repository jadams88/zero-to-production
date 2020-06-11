import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilderFacade } from '@ztp/common/form-builder';
import {
  TFormStructure,
  FormGroupTypes,
  FormFieldTypes,
  DynamicFormFacade,
  IDynamicFormConfig,
} from '@ztp/common/dynamic-form';
import { Validators } from '@angular/forms';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const STRUCTURE: TFormStructure = [
  {
    groupName: 'config',
    groupType: FormGroupTypes.Group,
    classes: ['form-builder-create'],
    fields: [
      {
        type: FormFieldTypes.Input,
        name: 'formName',
        label: 'Form Name',
        validators: [Validators.required],
      },
      {
        type: FormFieldTypes.CheckBox,
        name: 'animations',
        label: 'Animations',
      },
      {
        type: FormFieldTypes.CheckBox,
        name: 'paginateSections',
        label: 'Section Pages',
      },
    ],
  },
];

@Component({
  selector: 'ex-example-form-builder-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleFormBuilderCreateComponent implements OnInit, OnDestroy {
  faTrash = faTrash;

  readonly formName = 'form-builder-create';
  form$: Observable<IDynamicFormConfig[]>;
  sub: Subscription;

  constructor(
    private dynamicFormFacade: DynamicFormFacade,
    private formsFacade: FormBuilderFacade
  ) {
    this.form$ = this.formsFacade.form$;

    this.dynamicFormFacade.createFormIfNotExist(this.formName);

    this.sub = this.dynamicFormFacade
      .formSubmits$(this.formName)
      .subscribe((form: { config: Partial<IDynamicFormConfig> }) => {
        this.formsFacade.createForm(form.config);
        this.dynamicFormFacade.setData(this.formName, {});
      });
  }

  ngOnInit() {
    this.dynamicFormFacade.setFormConfig(this.formName, {
      structure: STRUCTURE,
    });
    this.dynamicFormFacade.setData(this.formName, {
      config: {
        animations: false,
        paginateSections: false,
      },
    });
    this.formsFacade.loadForms();
  }

  edit(form: IDynamicFormConfig) {
    this.formsFacade.selectForm(form.formName);
  }

  delete(form: IDynamicFormConfig) {
    this.formsFacade.deleteForm(form);
  }

  trackForms(i: number, f: IDynamicFormConfig) {
    return f.formName;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
