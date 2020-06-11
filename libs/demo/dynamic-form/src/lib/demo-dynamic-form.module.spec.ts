import { async, TestBed } from '@angular/core/testing';
import { DemoDynamicFormModule } from './demo-dynamic-form.module';

describe('DemoDynamicFormModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoDynamicFormModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoDynamicFormModule).toBeDefined();
  });
});
