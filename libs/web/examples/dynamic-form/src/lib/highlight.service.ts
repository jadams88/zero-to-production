import { Injectable, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
// import 'prismjs/components/prism-json';

@Injectable()
export class HighlightService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  highlightAll() {
    if (isPlatformBrowser(this.platformId)) {
      Prism.highlightAll();
    }
  }
}
