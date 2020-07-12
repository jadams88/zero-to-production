import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectApiComponent } from './select-api.component';

describe('SelectApiComponent', () => {
  let component: SelectApiComponent;
  let fixture: ComponentFixture<SelectApiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectApiComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
