import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class CodeHighlightService {
  private prism: any;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) doc: Document
  ) {
    this.prism = (doc.defaultView as any).Prism;
  }

  highlightAll() {
    if (isPlatformBrowser(this.platformId)) {
      this.prism.highlightAll();
    }
  }

  highlight(code: string, lang: string) {
    if (isPlatformBrowser(this.platformId)) {
      const tokens = this.prism.languages[lang];
      if (tokens) {
        return this.prism.highlight(code, tokens, lang);
      } else {
        return code;
      }
    }
  }
}
