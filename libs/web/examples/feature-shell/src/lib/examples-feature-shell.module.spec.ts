import { async, TestBed } from '@angular/core/testing';
import { ExamplesFeatureShellModule } from './examples-feature-shell.module';

describe('ExamplesFeatureShellModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ExamplesFeatureShellModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ExamplesFeatureShellModule).toBeDefined();
  });
});
