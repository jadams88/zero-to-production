import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// @ts-ignore
import marked from 'marked';
import { CodeHighlightService } from './highlight.service';

@Pipe({
  name: 'marked',
})
export class MarkedPipe implements PipeTransform {
  private options: any;

  constructor(private hl: CodeHighlightService, private sn: DomSanitizer) {
    const renderer = new marked.Renderer();
    renderer.link = this.openInNewTabLink.bind(this);

    this.options = {
      smartLists: true,
      smartypants: true,
      gfm: true,
      breaks: true,
      highlight: this.hl.highlight,
      renderer,
    };
  }

  transform(value: string | null): string | null {
    if (value && value.length > 0) {
      // marked.js does not put the 'language-ts' class on the <pre> tag.
      // Prism.js requires that is on the <pre> tag as well, use regex to do so
      const html: string = marked(value, this.options);

      return html.replace(
        /<pre>(\s*)<code class="([\w-]+)">/g,
        '<pre class="$2">$1<code class="$2">'
      );
    }
    return value;
  }

  /**
   * The default link generator does not open in a new tab
   *
   * @param href
   * @param title
   * @param text
   */
  openInNewTabLink(href: string, title: string, text: string) {
    return `<a
            target="_blank"
            rel="noreferrer noopener"
            href="${this.sn.sanitize(SecurityContext.URL, href)}"
            >${text}</a
          >`;
  }
}
