import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleDetailComponent } from './example-detail.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ExampleDetailComponent', () => {
  let component: ExampleDetailComponent;
  let fixture: ComponentFixture<ExampleDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleDetailComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
