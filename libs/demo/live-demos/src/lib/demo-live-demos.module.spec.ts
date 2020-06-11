import { async, TestBed } from '@angular/core/testing';
import { DemoLiveDemosModule } from './demo-live-demos.module';

describe('DemoLiveDemosModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoLiveDemosModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoLiveDemosModule).toBeDefined();
  });
});
