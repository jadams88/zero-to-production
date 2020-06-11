import { async, TestBed } from '@angular/core/testing';
import { DemoExamplesModule } from './demo-examples.module';

describe('DemoExamplesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoExamplesModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoExamplesModule).toBeDefined();
  });
});
