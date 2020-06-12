import {
  Directive,
  HostListener,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ModuleLoaderService } from '../module-loader.service';

@Directive({
  selector: '[ztpLazyLoadScroll]',
})
export class LazyLoadScrollDirective implements OnDestroy {
  private index = 1;
  private initLoad = false;
  private sub: Subscription;

  /**
   * @required
   */
  @Input() modules: number | undefined;
  @Input() loadThreshold = 400; // pixels until next load
  @Output() loadIndex = new EventEmitter<number>();

  constructor(private loadingService: ModuleLoaderService) {
    this.sub = this.loadingService.moduleLoaded$.subscribe((moduleKey) => {
      this.initLoad = false;
      // Unsubscribe if there are no modules to load anymore
      if (this.index === this.modules) {
        this.sub.unsubscribe();
      }
    });
  }

  /**
   * On each scroll event determine how many pixels from the bottom of the scroll
   * container. If less than the 'load threshold' emit the loadIndex event. The loading
   * service will emit once loaded and the initLoad flag will be flicked.
   *
   * @param event
   */
  @HostListener('scroll', ['$event'])
  scroll(event: Event) {
    if (this.modules) {
      const totalHeight = (event.target as HTMLElement).scrollHeight;
      const scrollTopPosition = (event.target as HTMLElement).scrollTop;
      const clientHeight = (event.target as HTMLElement).clientHeight;

      const pixelsFromBottom = totalHeight - clientHeight - scrollTopPosition;

      if (
        !this.initLoad &&
        pixelsFromBottom < this.loadThreshold && // default 400 px
        this.index <= this.modules - 1
      ) {
        this.loadIndex.emit(this.index);
        this.index++;
        this.initLoad = true;
      }
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
