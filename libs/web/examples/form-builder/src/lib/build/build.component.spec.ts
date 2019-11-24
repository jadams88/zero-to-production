import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleBuildFormComponent } from './build.component';

describe('ExampleBuildFormComponent', () => {
  let component: ExampleBuildFormComponent;
  let fixture: ComponentFixture<ExampleBuildFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleBuildFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleBuildFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
