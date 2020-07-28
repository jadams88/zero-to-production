import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { DynamicFormFacade } from '@ztp/common/dynamic-form';
import { Subscription } from 'rxjs';
import {
  AuthFacade,
  IRegistrationDetails,
  passwordMatchValidator,
} from '@ztp/common/auth/data-access';
import { REGISTER_STRUCTURE } from './register.structure';

interface IRegistrationFormStructure {
  details: {
    givenName: string;
    surname: string;
    email: string;
    dateOfBirth: string;
  };
  password: {
    username: string;
    password: string;
    passwordCheck: string;
  };
}

@Component({
  selector: 'ztp-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit, OnDestroy {
  readonly formName = 'register';

  private subscription: Subscription;

  constructor(
    private facade: AuthFacade,
    private formFacade: DynamicFormFacade
  ) {
    this.formFacade.createFormIfNotExist(this.formName);

    this.subscription = this.formFacade
      .formSubmits$(this.formName)
      .subscribe((details: IRegistrationFormStructure) => {
        this.register(details);
      });
  }

  ngOnInit() {
    const passwordCheck = passwordMatchValidator(
      'password',
      'password',
      'passwordCheck'
    );
    // we do want animations for the register form
    this.formFacade.setFormConfig(this.formName, {
      animations: true,
      paginateSections: true,
      structure: REGISTER_STRUCTURE,
      formValidators: [passwordCheck],
    });
  }

  register(details: IRegistrationFormStructure): void {
    const settings: IRegistrationDetails = {
      username: details.password.username,
      password: details.password.password,
      ...details.details,
    };

    this.facade.register(settings);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
