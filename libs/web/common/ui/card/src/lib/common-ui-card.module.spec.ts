import { async, TestBed } from '@angular/core/testing';
import { CommonUiCardModule } from './common-ui-card.module';

describe('CommonUiCardModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonUiCardModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonUiCardModule).toBeDefined();
  });
});
