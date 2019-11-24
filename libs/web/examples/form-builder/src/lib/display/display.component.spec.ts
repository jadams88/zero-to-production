import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleDisplayFormComponent } from './display.component';

describe('ExampleDisplayFormComponent', () => {
  let component: ExampleDisplayFormComponent;
  let fixture: ComponentFixture<ExampleDisplayFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleDisplayFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleDisplayFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
