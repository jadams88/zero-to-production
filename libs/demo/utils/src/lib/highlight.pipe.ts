import { Pipe, PipeTransform } from '@angular/core';
import { CodeHighlightService } from './highlight.service';

@Pipe({
  name: 'codeHighlight',
})
export class CodeHighlightPipe implements PipeTransform {
  constructor(private hl: CodeHighlightService) {}

  transform(code: string | null, lang: string = 'json'): string | null {
    if (code && code.length > 0) {
      return this.hl.highlight(code, lang);
    }
    return code;
  }
}
