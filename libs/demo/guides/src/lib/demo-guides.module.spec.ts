import { async, TestBed } from '@angular/core/testing';
import { DemoGuidesModule } from './demo-guides.module';

describe('DemoGuidesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoGuidesModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoGuidesModule).toBeDefined();
  });
});
