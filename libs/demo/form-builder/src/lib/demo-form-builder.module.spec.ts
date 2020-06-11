import { async, TestBed } from '@angular/core/testing';
import { DemoFormBuilderModule } from './demo-form-builder.module';

describe('DemoFormBuilderModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoFormBuilderModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoFormBuilderModule).toBeDefined();
  });
});
