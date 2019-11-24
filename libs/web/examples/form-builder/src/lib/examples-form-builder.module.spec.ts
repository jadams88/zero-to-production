import { async, TestBed } from '@angular/core/testing';
import { WebExamplesFormBuilderModule } from './examples-form-builder.module';

describe('WebExamplesFormBuilderModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [WebExamplesFormBuilderModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(WebExamplesFormBuilderModule).toBeDefined();
  });
});
