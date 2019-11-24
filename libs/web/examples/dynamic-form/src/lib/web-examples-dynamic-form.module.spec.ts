import { async, TestBed } from '@angular/core/testing';
import { WebExamplesDynamicFormModule } from './web-examples-dynamic-form.module';

describe('WebExamplesDynamicFormModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [WebExamplesDynamicFormModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(WebExamplesDynamicFormModule).toBeDefined();
  });
});
