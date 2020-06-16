import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleTodosComponent } from './example-todos.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ExampleTodosComponent', () => {
  let component: ExampleTodosComponent;
  let fixture: ComponentFixture<ExampleTodosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ExampleTodosComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleTodosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
