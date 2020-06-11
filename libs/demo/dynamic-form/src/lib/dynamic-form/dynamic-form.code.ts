export const moduleRegistry = `// app.module.ts
@NgModule({
  imports: [
    ...
    CommonDynamicFormModule.forRoot({
      components: APP_COMPONENTS,
      errors: APP_ERRORS
    }),
   ...
  ]
})
export class AppModule {}
`;

export const setStructureMarkup = `// example.component.ts
const CONTACT_DETAILS: TFormStructure = [
  {
    formGroup: 'contactDetails',
    groupType: FormGroupTypes.Group,
    fields: [
      {
        componentType: FormFieldTypes.Input,
        type: 'text',
        name: 'contactNumber',
        label: 'Contact Number',
        validators: [Validators.required]
      },
      {
        componentType: FormFieldTypes.Input,
        type: 'email',
        name: 'emailAddress',
        label: 'Email Address',
        validators: [Validators.required, Validators.email]
      }
    ]
  }
];

@Component({
  ...
})
export class ExampleDynamicFormComponent {
  readonly formName = 'dynamic-form-example';
  
constructor(private formFacade: DynamicFormFacade) {
  this.formFacade.createFormIfNotExist(this.formName);
}

ngOnInit() {
  this.formFacade.setStructure({ structure: CONTACT_DETAILS });
}`;

export const markup = `<!-- example.component.html -->
<app-dynamic-form [formName]="formName">
  <button type="submit">Submit</button>
</app-dynamic-form>`;

export const submitSyntax = `// example.component.ts
constructor(private formFacade: DynamicFormFacade) {

  this.formFacade.formSubmits$(this.formName)
    .subscribe(formOutput => {
      // do something with the output
    });
}`;
