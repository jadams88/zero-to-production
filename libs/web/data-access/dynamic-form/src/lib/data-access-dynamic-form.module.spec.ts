import { async, TestBed } from '@angular/core/testing';
import { DynamicFormModule } from './data-access-dynamic-form.module';

describe('DynamicFormModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DynamicFormModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DynamicFormModule).toBeDefined();
  });
});
