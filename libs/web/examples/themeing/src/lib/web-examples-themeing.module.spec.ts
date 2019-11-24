import { async, TestBed } from '@angular/core/testing';
import { WebExamplesThemeingModule } from './web-examples-themeing.module';

describe('WebExamplesThemeingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [WebExamplesThemeingModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(WebExamplesThemeingModule).toBeDefined();
  });
});
