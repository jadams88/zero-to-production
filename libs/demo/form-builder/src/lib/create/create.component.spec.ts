import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleFormBuilderCreateComponent } from './create.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilderFacade } from '@ztp/common/form-builder';
import { DynamicFormFacade } from '@ztp/common/dynamic-form';
import { of } from 'rxjs';

describe('ExampleFormBuilderCreateComponent', () => {
  let component: ExampleFormBuilderCreateComponent;
  let fixture: ComponentFixture<ExampleFormBuilderCreateComponent>;

  const builderSpy = {
    selectedForm$: jest.fn(),
    form$: jest.fn(),
  };

  const formSpy = {
    createFormIfNotExist: jest.fn(),
    formSubmits$: () => of(jest.fn()),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleFormBuilderCreateComponent],
      providers: [
        { provide: FormBuilderFacade, useValue: builderSpy },
        { provide: DynamicFormFacade, useValue: formSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleFormBuilderCreateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
