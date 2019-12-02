import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDatePickerComponent } from './date-picker.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormService } from '../../dynamic-form.service';

describe('DatePickerComponent', () => {
  let component: FormDatePickerComponent;
  let fixture: ComponentFixture<FormDatePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [{ provide: DynamicFormService, useValue: {} }],
      declarations: [FormDatePickerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDatePickerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
