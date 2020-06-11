import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoFeatureShellComponent } from './demo-feature-shell.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DemoFacade } from '@ztp/demo/data-access';

describe('DemoFeatureShellComponent', () => {
  let component: DemoFeatureShellComponent;
  let fixture: ComponentFixture<DemoFeatureShellComponent>;

  const facadeSpy = { addExamples: jest.fn() };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DemoFeatureShellComponent],
      providers: [{ provide: DemoFacade, useValue: facadeSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoFeatureShellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
