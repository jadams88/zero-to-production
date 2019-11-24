import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthFacade } from '../../+state/auth.facade';
import { of } from 'rxjs';
import { DynamicFormFacade } from '@ngw/data-access/dynamic-form';

// TODO -> TESTS
describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [
        {
          provide: AuthFacade,
          useValue: { usernameAvailability$: of(jest.fn()) }
        },
        {
          provide: DynamicFormFacade,
          useValue: { submit$: of(jest.fn()) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
