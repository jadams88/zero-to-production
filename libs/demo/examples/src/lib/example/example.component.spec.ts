import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ExampleComponent } from './example.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DemoFacade } from '@ztp/demo/data-access';
import { RouterFacade } from '@ztp/common/router';
import { of } from 'rxjs';

describe('ExampleComponent', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;
  const demoSpy = { examples$: jest.fn() };
  const routerSpy = { url$: of(jest.fn()) };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ExampleComponent],
      providers: [
        { provide: DemoFacade, useValue: demoSpy },
        { provide: RouterFacade, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
