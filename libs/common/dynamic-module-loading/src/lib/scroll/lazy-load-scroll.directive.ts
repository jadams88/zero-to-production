import {
  Directive,
  HostListener,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
  Inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ModuleLoaderService,
  ILazyModule,
  LAZY_MODULES,
} from '../module-loader.service';

@Directive({
  selector: '[ztpLazyLoadScroll]',
})
export class LazyLoadScrollDirective implements OnDestroy {
  private initLoad = false;
  private sub: Subscription;
  private _keys: string[] = [];

  @Input() loadThreshold = 400;
  @Output() loadModule = new EventEmitter<string>();

  constructor(
    @Inject(LAZY_MODULES)
    modules: ILazyModule[],
    private service: ModuleLoaderService
  ) {
    this._keys = modules.map((m) => m.key);

    this.sub = this.service.moduleLoaded$.subscribe((loadedKey) => {
      const [key] = this._keys;

      // remove the first element if it has been loaded
      if (key === loadedKey) {
        this._keys.shift();
      }

      if (this._keys.length === 0) {
        this.sub.unsubscribe();
      }

      this.initLoad = false;
    });
  }

  /**
   * On each scroll event determine how many pixels from the bottom of the scroll
   * container. If less than the 'load threshold' emit the loadModule event. The loading
   * service will emit once loaded and the initLoad flag will be flicked.
   *
   * @param event
   */
  @HostListener('scroll', ['$event'])
  scroll(event: Event) {
    if (
      this.initLoad === false &&
      this._keys.length > 0 &&
      this.pixelsFromBottom(event.target as HTMLElement) < this.loadThreshold
    ) {
      const [key] = this._keys;
      this.loadModule.emit(key);
      this.initLoad = true;
    }
  }

  pixelsFromBottom(target: HTMLElement): number {
    return target.scrollHeight - target.clientHeight - target.scrollTop;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
