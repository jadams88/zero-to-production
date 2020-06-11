import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { FormBuilderFacade } from '@ztp/common/form-builder';
import { DynamicFormFacade } from '@ztp/common/dynamic-form';
import { DemoUtilsModule } from '@ztp/demo/utils';
import { ExampleFormBuilderDisplayComponent } from './display.component';

describe('ExampleFormBuilderDisplayComponent', () => {
  let component: ExampleFormBuilderDisplayComponent;
  let fixture: ComponentFixture<ExampleFormBuilderDisplayComponent>;

  const builderSpy = {
    selectedForm$: of(jest.fn()),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoUtilsModule],
      declarations: [ExampleFormBuilderDisplayComponent],
      providers: [
        { provide: FormBuilderFacade, useValue: builderSpy },
        { provide: DynamicFormFacade, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
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
