import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { FormsFacade } from '@ngw/data-access/form-builder';
import { RouterFacade } from '@ngw/data-access/router';
import { IFormBuilderStructure } from '@ngw/types';

@Component({
  selector: 'ngw-example-form-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleCreateFormComponent {
  form$: Observable<IFormBuilderStructure[]>;

  constructor(
    private formsFacade: FormsFacade,
    private routerFacade: RouterFacade
  ) {
    this.form$ = this.formsFacade.form$;
  }

  edit(form: IFormBuilderStructure) {
    this.formsFacade.selectForm(form.id);
    this.routerFacade.go({
      path: ['examples', 'form-builder', form.id, 'edit']
    });
  }

  delete(form: IFormBuilderStructure) {
    this.formsFacade.deleteForm(form);
  }

  display(form: IFormBuilderStructure) {
    this.formsFacade.selectForm(form.id);
    this.routerFacade.go({
      path: ['examples', 'form-builder', form.id, 'display']
    });
  }

  trackForms(i: number, f: IFormBuilderStructure) {
    return f.id;
  }
}
