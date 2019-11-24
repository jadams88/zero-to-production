import { async, TestBed } from '@angular/core/testing';
import { ExamplesDataAccessModule } from './examples-data-access.module';

describe('ExamplesDataAccessModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ExamplesDataAccessModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ExamplesDataAccessModule).toBeDefined();
  });
});
