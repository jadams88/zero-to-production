import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ILoginCredentials, TFormGroups } from '@ngw/types';
import { DynamicFormFacade } from '@ngw/data-access/dynamic-form';
import { FormGroupTypes, FormFieldTypes } from '@ngw/enums';
import { AuthFacade } from '@ngw/data-access/auth';

const STRUCTURE: TFormGroups = [
  {
    formGroup: 'credentials',
    groupType: FormGroupTypes.Group,
    fields: [
      {
        componentType: FormFieldTypes.Input,
        type: 'text',
        name: 'username',
        label: 'Username',
        autocomplete: 'username',
        validators: [Validators.required]
      },
      {
        componentType: FormFieldTypes.Input,
        type: 'password',
        name: 'password',
        label: 'Password',
        autocomplete: 'current-password',
        validators: [Validators.required]
      }
    ]
  }
];

@Component({
  selector: 'ngw-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  constructor(
    private formFacade: DynamicFormFacade,
    private facade: AuthFacade
  ) {
    this.subscription = this.formFacade.submit$.subscribe(
      ({ credentials }: { credentials: ILoginCredentials }) => {
        this.facade.login(credentials);
      }
    );
  }

  ngOnInit() {
    // We do not want form group animations for the login page.
    this.formFacade.setFormConfig({ animations: false });
    this.formFacade.setStructure({ structure: STRUCTURE });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
