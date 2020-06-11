import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidesComponent } from './guides.component';
import { CodeHighlightService } from '@ztp/demo/utils';

describe('GuidesComponent', () => {
  let component: GuidesComponent;
  let fixture: ComponentFixture<GuidesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GuidesComponent],
      providers: [{ provide: CodeHighlightService, useValue: {} }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
