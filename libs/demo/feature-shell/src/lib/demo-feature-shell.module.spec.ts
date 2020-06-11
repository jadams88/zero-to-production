import { async, TestBed } from '@angular/core/testing';
import { DemoFeatureShellModule } from './demo-feature-shell.module';

describe('DemoFeatureShellModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoFeatureShellModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoFeatureShellModule).toBeDefined();
  });
});
