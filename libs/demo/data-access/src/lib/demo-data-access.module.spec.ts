import { async, TestBed } from '@angular/core/testing';
import { DemoDataAccessModule } from './demo-data-access.module';

describe('DemoDataAccessModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoDataAccessModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoDataAccessModule).toBeDefined();
  });
});
