import { async, TestBed } from '@angular/core/testing';
import { CommonDynamicModuleLoadingModule } from './common-dynamic-module-loading.module';

describe('CommonDynamicModuleLoadingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonDynamicModuleLoadingModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonDynamicModuleLoadingModule).toBeDefined();
  });
});
