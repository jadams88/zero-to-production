import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemeService } from '@ztp/common/utils/theme';
import { CodeHighlightService } from '@ztp/demo/utils';
import { css, ts, appInit, prefersDarkMode } from './css-theming.code';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Observable } from 'rxjs';

@Component({
  selector: 'ex-css-theming',
  templateUrl: './css-theming.component.html',
  styleUrls: ['./css-theming.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssThemingComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  dark$: Observable<boolean>;

  css = css;
  ts = ts;
  prefersDarkMode = prefersDarkMode;
  appInit = appInit;

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private highlightService: CodeHighlightService
  ) {
    this.dark$ = this.themeService.darkMode$;
    this.form = this.fb.group(this.baseTheme);

    this.form.valueChanges.subscribe((themeSettings) => {
      this.themeService.setThemeColors(themeSettings);
    });
  }

  ngOnInit() {
    const theme = this.themeService.themeSettings;
    this.form.reset(theme ? theme : this.baseTheme, { emitEvent: false });
  }

  resetTheme() {
    this.form.reset(this.baseTheme);
  }

  get baseTheme() {
    const defaultTheme = this.themeService.defaultTheme;
    return {
      lightPrimary: [defaultTheme.lightPrimary],
      lightAccent: [defaultTheme.lightAccent],
      darkPrimary: [defaultTheme.darkPrimary],
      darkAccent: [defaultTheme.darkAccent],
    };
  }

  darkThemeChanged(change: MatCheckboxChange) {
    this.themeService.setDarkThemeStatus(change.checked);
  }

  ngAfterViewInit() {
    this.highlightService.highlightAll();
  }
}
