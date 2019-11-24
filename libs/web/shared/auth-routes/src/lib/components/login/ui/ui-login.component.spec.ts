import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UiLoginComponent } from './ui-login.component';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// TODO  -> TESTS

describe('UiLoginComponent', () => {
  let component: UiLoginComponent;
  let fixture: ComponentFixture<UiLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UiLoginComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UiLoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
