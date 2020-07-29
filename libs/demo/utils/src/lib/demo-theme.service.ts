import {
  Injectable,
  Inject,
  PLATFORM_ID,
  RendererFactory2,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { ThemeService } from '@ztp/common/utils/theme';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DemoThemeService extends ThemeService implements OnDestroy {
  resources = {
    light: {
      href:
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0/themes/prism-tomorrow.min.css',
      integrity:
        'sha256-xevuwyBEb2ZYh4nDhj0g3Z/rDBnM569hg9Vq6gEw/Sg= sha384-EEP4SIhERVuvVqU0Y31IKqQhM9AornnryBxQBldu3N9mK5H1YBol78SoFa70zdNO sha512-SR4UXeuuhpoxkcnSd08+IU7VYA80Kfv9dyzEdM/gaRe+UwZn50BsQT6ZME/3vtIqeoxCBZQek6pfx2Q8QPszNg==',
    },
    dark: {
      href:
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0/themes/prism-solarizedlight.min.css',
      integrity:
        'sha256-HOU1NO4lX42RnSzc4CxjFJxeEIcnOenRG01ycywzmR8= sha384-GBgeF/CVsm6fXwQuh7IfkMAIL3PsfqMrWqg0NwGx29TXnvP0bzh6ymbpMFGMm+Fk sha512-Vy5HEYgHKrCbVXD+O0e3cx/MCZpe8hEUA3KeF63QblnYWcDAJ9cgjUhAY85rNpum8r9yEr6mm+e7JtQ5g6MMng==',
    },
  };

  private _re: Renderer2;
  private _head: HTMLElement;
  private prismLinks: HTMLElement[] = [];
  private prismSub: Subscription;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) document: Document,
    rendererFactory: RendererFactory2,
    overlayContainer: OverlayContainer
  ) {
    super(platformId, document, rendererFactory, overlayContainer);

    this._re = rendererFactory.createRenderer(null, null);
    this._head = document.head;

    const resources = this.resources;
    this.prismSub = this.theme$.subscribe(async ([mainTheme, darkMode]) => {
      if (darkMode) {
        await this.togglePrismTheme(resources.dark);
      } else {
        await this.togglePrismTheme(resources.light);
      }

      if (this.prismLinks.length === 2)
        this._re.removeChild(this._head, this.prismLinks.shift());
    });
  }

  togglePrismTheme({ href, integrity }: { href: string; integrity: string }) {
    return new Promise((resolve) => {
      const linkEl: HTMLElement = this._re.createElement('link');
      this._re.setAttribute(linkEl, 'rel', 'stylesheet');
      this._re.setAttribute(linkEl, 'type', 'text/css');
      this._re.setAttribute(linkEl, 'crossorigin', 'anonymous');
      this._re.setAttribute(linkEl, 'integrity', integrity);
      this._re.setAttribute(linkEl, 'href', href);
      this._re.setProperty(linkEl, 'onload', resolve);
      this._re.appendChild(this._head, linkEl);
      this.prismLinks = [...this.prismLinks, linkEl];
    });
  }

  ngOnDestroy() {
    this.prismSub.unsubscribe();
    super.ngOnDestroy();
  }
}
