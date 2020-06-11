import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollingComponent } from './scrolling.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CodeHighlightService } from '@ztp/demo/utils';

describe('ScrollingComponent', () => {
  let component: ScrollingComponent;
  let fixture: ComponentFixture<ScrollingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScrollingComponent],
      providers: [{ provide: CodeHighlightService, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
