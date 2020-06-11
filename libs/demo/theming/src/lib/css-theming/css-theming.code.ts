export const css = `// styles.scss
:root {
  --light-primary-color: #ffaa00;
  --light-accent-color: #0047b3;
  --dark-primary-color: #d33685;
  --dark-accent-color: #20eff0;
}

// If you are using a custom material theme you can provide them to your pallet
$light-primary-pallet: (
  ...
  400: #ff7043,
  500: var(--light-primary-color),
  600: #ff4f1e,
  ...
);`;

export const ts = `// theme.service.ts
constructor(@Inject(DOCUMENT) private document: Document) {}

...
setThemeColors({
  lightPrimary = null,
  lightAccent = null,
  darkPrimary = null,
  darkAccent = null
}): void {
  const rootElement = this.document.querySelector(':root') as HTMLElement;

  rootElement.style.setProperty('--light-primary-color', lightPrimary);
  rootElement.style.setProperty('--light-accent-color', lightAccent);
  rootElement.style.setProperty('--dark-primary-color', darkPrimary);
  rootElement.style.setProperty('--dark-accent-color', darkAccent);
}`;

export const appInit = `// theme.service.ts
...
saveColorsToLocalStorage(colors: any) {
  localStorage.setItem(this.storageKey, JSON.stringify(colors));
}

loadAndApplyColors() {
  const colors: any = localStorage.getItem(this.storageKey);
  if (colors) this.setThemeColors(JSON.parse(colors));
}


// factory function
export function themeProviderFactory(service: ThemeService) {
  return () => service.loadAndApplyColors();
}


// app.module.ts
@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: themeProviderFactory,
      multi: true,
      deps: [ThemeService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}`;

export const prefersDarkMode = `// theme.service.ts
let setDarkMode = false;
if (isPlatformBrowser(this.platformId) && window.matchMedia) {
  // The 'matches' property will return true if the the user prefers dark mode
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
  // If the user prefers dark mode then set to true
  setDarkMode = prefersDarkMode.matches;
  this.mql = prefersDarkMode;
  /* Register for future events */
  this.mqlListener = (mq) => {
    this.setDarkThemeStatus(mq.matches);
  };

  this.mql.addEventListener('change', this.mqlListener);
}`;
