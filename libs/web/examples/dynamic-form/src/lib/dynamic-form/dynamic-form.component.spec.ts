import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleDynamicFormComponent } from './dynamic-form.component';

describe('ExampleDynamicFormComponent', () => {
  let component: ExampleDynamicFormComponent;
  let fixture: ComponentFixture<ExampleDynamicFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleDynamicFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
