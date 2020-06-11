import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleDynamicFormComponent } from './dynamic-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DemoFacade } from '@ztp/demo/data-access';
import { of } from 'rxjs';
import { DynamicFormFacade } from '@ztp/common/dynamic-form';
import { CodeHighlightService } from '@ztp/demo/utils';
import { DemoUtilsModule } from '@ztp/demo/utils';

describe('ExampleDynamicFormComponent', () => {
  let component: ExampleDynamicFormComponent;
  let fixture: ComponentFixture<ExampleDynamicFormComponent>;
  const facadeSpy = { selectExampleById: jest.fn() };
  const dynamicFormSpy = {
    createFormIfNotExist: jest.fn(),
    formSubmits$: () => of(jest.fn()),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoUtilsModule],
      declarations: [ExampleDynamicFormComponent],
      providers: [
        { provide: DemoFacade, useValue: facadeSpy },
        { provide: DynamicFormFacade, useValue: dynamicFormSpy },
        { provide: CodeHighlightService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleDynamicFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
