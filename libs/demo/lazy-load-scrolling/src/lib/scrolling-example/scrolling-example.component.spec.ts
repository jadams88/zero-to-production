import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollingExampleComponent } from './scrolling-example.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CodeHighlightService } from '@ztp/demo/utils';

describe('ScrollingExampleComponent', () => {
  let component: ScrollingExampleComponent;
  let fixture: ComponentFixture<ScrollingExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScrollingExampleComponent],
      providers: [{ provide: CodeHighlightService, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollingExampleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
