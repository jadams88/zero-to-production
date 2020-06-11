import { async, TestBed } from '@angular/core/testing';
import { DemoThemingModule } from './demo-theming.module';

describe('DemoThemingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoThemingModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoThemingModule).toBeDefined();
  });
});
