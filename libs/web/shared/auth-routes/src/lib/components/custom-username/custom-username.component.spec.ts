import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomUsernameComponent } from './custom-username.components';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// TODO -> TESTS
describe('CustomUsernameComponent', () => {
  let component: CustomUsernameComponent;
  let fixture: ComponentFixture<CustomUsernameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomUsernameComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomUsernameComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
