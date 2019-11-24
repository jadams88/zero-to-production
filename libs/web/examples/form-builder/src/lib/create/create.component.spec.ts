import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleCreateFormComponent } from './create.component';

describe('ExampleCreateFormComponent', () => {
  let component: ExampleCreateFormComponent;
  let fixture: ComponentFixture<ExampleCreateFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleCreateFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
