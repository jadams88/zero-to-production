import { async, TestBed } from '@angular/core/testing';
import { DemoStartYourOwnModule } from './demo-start-your-own.module';

describe('DemoStartYourOwnModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoStartYourOwnModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoStartYourOwnModule).toBeDefined();
  });
});
