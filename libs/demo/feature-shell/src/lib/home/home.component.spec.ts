import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoHomeComponent } from './home.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DemoFacade } from '@ztp/demo/data-access';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('DemoHomeComponent', () => {
  let component: DemoHomeComponent;
  let fixture: ComponentFixture<DemoHomeComponent>;
  const facadeSpy = { demo$: of(jest.fn) };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [DemoHomeComponent],
      providers: [{ provide: DemoFacade, useValue: facadeSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoHomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
