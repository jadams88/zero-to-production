import { async, TestBed } from '@angular/core/testing';
import { DynamicFormMaterialComponentsModule } from './data-access-dynamic-form-material-components.module';

describe('DynamicFormMaterialComponentsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DynamicFormMaterialComponentsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DynamicFormMaterialComponentsModule).toBeDefined();
  });
});
