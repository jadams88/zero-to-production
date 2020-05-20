import {
  Injectable,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  RendererFactory2,
  Renderer2,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Observable, BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { MediaQueryService } from '@ztp/common/utils/media-query';

// TODO -> Document theme service
// Credits
// https://medium.com/better-programming/angular-multiple-themes-without-killing-bundle-size-with-material-or-not-5a80849b6b34
//

interface IThemeSettings {
  darkMode?: boolean;
  lightPrimary?: string | null;
  lightAccent?: string | null;
  darkPrimary?: string | null;
  darkAccent?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ThemeService extends MediaQueryService implements OnDestroy {
  private sub: Subscription;
  private _renderer: Renderer2;
  private head: HTMLElement;
  storageKey = 'theme-settings';
  private themeLinks: HTMLElement[] = [];

  private darkMode = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkMode.asObservable();

  private _mainTheme$: BehaviorSubject<string> = new BehaviorSubject(
    'theme-default'
  );

  theme$: Observable<[string, boolean]>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2,
    overlayContainer: OverlayContainer
  ) {
    super();

    if (isPlatformBrowser(this.platformId)) {
      const prefersDarkMode = this.listenToMediaQuery(
        '(prefers-color-scheme: dark)',
        this.setDarkThemeStatus.bind(this)
      );

      if (prefersDarkMode !== undefined) this.darkMode.next(prefersDarkMode);
    }

    this._renderer = rendererFactory.createRenderer(null, null);
    this.head = this.document.head;

    this.theme$ = combineLatest([this._mainTheme$, this.darkMode$]);
    this.sub = this.theme$.subscribe(async ([mainTheme, darkMode]) => {
      const cssExt = '.css';
      const cssFilename = darkMode
        ? mainTheme + '-dark' + cssExt
        : mainTheme + cssExt;
      await this.loadCss(cssFilename);
      if (this.themeLinks.length === 2)
        this._renderer.removeChild(this.head, this.themeLinks.shift());
    });

    this.sub.add(
      this.darkMode$.subscribe((active) => {
        const overlayClassList = overlayContainer.getContainerElement()
          .classList;
        if (active) {
          overlayClassList.add('dark-theme');
        } else {
          overlayClassList.remove('dark-theme');
        }
      })
    );
  }

  get defaultTheme() {
    return {
      lightPrimary: '#516a84',
      lightAccent: '#519191',
      darkPrimary: '#80a7d1',
      darkAccent: '#f7ded6',
    };
  }

  setThemeColors(colors: any): void {
    this.applyColors(colors);
    this.setThemeSettings(colors);
  }

  private applyColors({
    lightPrimary = null,
    lightAccent = null,
    darkPrimary = null,
    darkAccent = null,
  }: IThemeSettings = {}) {
    if (isPlatformBrowser(this.platformId)) {
      const rootElement = this.document.querySelector(':root') as HTMLElement;

      rootElement.style.setProperty('--light-primary-color', lightPrimary);
      rootElement.style.setProperty('--light-accent-color', lightAccent);
      rootElement.style.setProperty('--dark-primary-color', darkPrimary);
      rootElement.style.setProperty('--dark-accent-color', darkAccent);
    }
  }

  private setThemeSettings(theme: { [key: string]: string | boolean }) {
    const savedTheme = this.themeSettings;
    const newTheme = savedTheme
      ? { ...savedTheme, ...theme }
      : { ...this.defaultTheme, ...theme };
    localStorage.setItem(this.storageKey, JSON.stringify(newTheme));
  }

  loadAndApplyColors() {
    if (isPlatformBrowser(this.platformId)) {
      const theme = this.themeSettings;
      if (theme) {
        const { darkMode } = theme;
        if (darkMode !== undefined) this.setDarkThemeStatus(darkMode);
        this.applyColors(theme);
      }
    }
  }

  get themeSettings(): IThemeSettings {
    const theme = localStorage.getItem(this.storageKey);
    return theme ? JSON.parse(theme) : null;
  }

  setDarkThemeStatus(darkMode: boolean): void {
    this.darkMode.next(darkMode);
    this.setThemeSettings({ darkMode });
  }

  private async loadCss(filename: string) {
    return new Promise((resolve) => {
      const linkEl: HTMLElement = this._renderer.createElement('link');
      this._renderer.setAttribute(linkEl, 'rel', 'stylesheet');
      this._renderer.setAttribute(linkEl, 'type', 'text/css');
      this._renderer.setAttribute(linkEl, 'href', filename);
      this._renderer.setProperty(linkEl, 'onload', resolve);
      this._renderer.appendChild(this.head, linkEl);
      this.themeLinks = [...this.themeLinks, linkEl];
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.removeMediaListener();
  }
}

export function themeProviderFactory(service: ThemeService) {
  return () => service.loadAndApplyColors();
}
