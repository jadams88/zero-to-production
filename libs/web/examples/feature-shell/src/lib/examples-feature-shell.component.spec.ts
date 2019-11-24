import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamplesFeatureShellComponent } from './examples-feature-shell.component';

describe('ExamplesFeatureShellComponent', () => {
  let component: ExamplesFeatureShellComponent;
  let fixture: ComponentFixture<ExamplesFeatureShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExamplesFeatureShellComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamplesFeatureShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
