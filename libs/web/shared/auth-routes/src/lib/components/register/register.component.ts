import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { IRegistrationDetails } from '@ngw/types';
import { DynamicFormFacade } from '@ngw/data-access/dynamic-form';
import { REGISTER_STRUCTURE } from './register.structure';
import { Subscription } from 'rxjs';
import { passwordMatchValidator } from '../../validators/auth.validators';
import { AuthFacade } from '@ngw/data-access/auth';

interface IRegistrationFormStructure {
  details: {
    givenName: string;
    surname: string;
    email: string;
    dateOfBirth: string;
  };
  themeSettings: {
    darkMode: boolean;
    lightPrimary: string;
    lightAccent: string;
    darkPrimary: string;
    darkAccent: string;
  };
  password: {
    username: string;
    password: string;
    passwordCheck: string;
  };
}

@Component({
  selector: 'ngw-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(
    private facade: AuthFacade,
    private formFacade: DynamicFormFacade
  ) {
    this.subscription = this.formFacade.submit$.subscribe(
      (details: IRegistrationFormStructure) => {
        this.register(details);
      }
    );
  }

  ngOnInit() {
    const passwordCheck = passwordMatchValidator(
      'password',
      'password',
      'passwordCheck'
    );
    // we do want animations for the register form
    this.formFacade.setFormConfig({ animations: true });
    this.formFacade.setFormValidators([passwordCheck]);
    this.formFacade.setStructure({ structure: REGISTER_STRUCTURE });
  }

  register(details: IRegistrationFormStructure): void {
    // pop the darkMode off from the collection
    const { darkMode, ...colors } = details.themeSettings;

    const settings: IRegistrationDetails = {
      username: details.password.username,
      ...details.details,
      settings: {
        darkMode,
        colors
      },
      password: details.password.password
    };

    this.facade.register(settings);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.facade.clearAvailable();
    this.formFacade.resetFormValidators();
  }
}
