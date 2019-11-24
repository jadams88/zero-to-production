import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UiRegisterComponent } from './ui-register.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// TODO - TESTS

describe('UiRegisterComponent', () => {
  let component: UiRegisterComponent;
  let fixture: ComponentFixture<UiRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UiRegisterComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UiRegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
