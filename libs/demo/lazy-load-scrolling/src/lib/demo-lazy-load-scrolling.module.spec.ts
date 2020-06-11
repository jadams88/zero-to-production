import { async, TestBed } from '@angular/core/testing';
import { DemoLazyLoadScrollingModule } from './demo-lazy-load-scrolling.module';

describe('DemoLazyLoadScrollingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoLazyLoadScrollingModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoLazyLoadScrollingModule).toBeDefined();
  });
});
