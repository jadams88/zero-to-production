import { async, TestBed } from '@angular/core/testing';
import { SharedAuthRoutesModule } from './shared-auth-routes.module';

describe('SharedAuthRoutesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedAuthRoutesModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SharedAuthRoutesModule).toBeDefined();
  });
});
