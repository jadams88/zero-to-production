import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleFormBuilderBuildComponent } from './build.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilderFacade } from '@ztp/common/form-builder';

describe('ExampleFormBuilderBuildComponent', () => {
  let component: ExampleFormBuilderBuildComponent;
  let fixture: ComponentFixture<ExampleFormBuilderBuildComponent>;

  const builderSpy = {
    selectedForm$: jest.fn(),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleFormBuilderBuildComponent],
      providers: [{ provide: FormBuilderFacade, useValue: builderSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleFormBuilderBuildComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
