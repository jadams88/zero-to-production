import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleFormBuilderOverviewComponent } from './overview.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ExampleFormBuilderOverviewComponent', () => {
  let component: ExampleFormBuilderOverviewComponent;
  let fixture: ComponentFixture<ExampleFormBuilderOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleFormBuilderOverviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleFormBuilderOverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
