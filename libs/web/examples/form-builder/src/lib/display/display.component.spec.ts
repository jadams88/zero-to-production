import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleFormBuilderDisplayComponent } from './display.component';
import { FormBuilderFacade } from '@uqt/data-access/form-builder';
import { DynamicFormFacade } from '@uqt/data-access/dynamic-form';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('ExampleFormBuilderDisplayComponent', () => {
  let component: ExampleFormBuilderDisplayComponent;
  let fixture: ComponentFixture<ExampleFormBuilderDisplayComponent>;

  const builderSpy = {
    selectedForm$: of(jest.fn())
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleFormBuilderDisplayComponent],
      providers: [
        { provide: FormBuilderFacade, useValue: builderSpy },
        { provide: DynamicFormFacade, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleFormBuilderDisplayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
