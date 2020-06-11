import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// @ts-ignore
import { highlightAll, highlight, languages } from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';

@Injectable({ providedIn: 'root' })
export class CodeHighlightService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  highlightAll() {
    if (isPlatformBrowser(this.platformId)) {
      highlightAll();
    }
  }

  highlight(code: string, lang: string) {
    const tokens = languages[lang];
    if (tokens) {
      return highlight(code, tokens, lang);
    } else {
      return code;
    }
  }
}
