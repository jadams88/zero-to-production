import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CssThemingComponent } from './css-theming.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ThemeService } from '@ztp/common/utils/theme';
import { CodeHighlightService } from '@ztp/demo/utils';

const themeServiceMock = {
  defaultTheme() {
    return {
      lightPrimary: '#ffaa00',
      lightAccent: '#0047B3',
      darkPrimary: '#d33685',
      darkAccent: '#20eff0',
    };
  },
};

describe('CssThemingComponent', () => {
  let component: CssThemingComponent;
  let fixture: ComponentFixture<CssThemingComponent>;
  let themeService: ThemeService;
  let highlightService: CodeHighlightService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CssThemingComponent],
      providers: [
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: CodeHighlightService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    themeService = TestBed.inject(ThemeService);
    highlightService = TestBed.inject(CodeHighlightService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CssThemingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
