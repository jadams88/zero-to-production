import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DemoExamplesComponent } from './examples-demos.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DemoFacade } from '@ztp/demo/data-access';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@ztp/common/utils/dynamic-module-loading';

describe('DemoExamplesComponent', () => {
  let component: DemoExamplesComponent;
  let fixture: ComponentFixture<DemoExamplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DemoExamplesComponent],
      providers: [
        { provide: DemoFacade, useValue: { examples$: of(jest.fn()) } },
        { provide: ModuleLoaderService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoExamplesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
