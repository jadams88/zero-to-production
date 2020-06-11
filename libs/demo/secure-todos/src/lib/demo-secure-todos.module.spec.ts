import { async, TestBed } from '@angular/core/testing';
import { DemoSecureTodosModule } from './demo-secure-todos.module';

describe('DemoSecureTodosModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoSecureTodosModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DemoSecureTodosModule).toBeDefined();
  });
});
