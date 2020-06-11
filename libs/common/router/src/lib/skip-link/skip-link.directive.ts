import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SkipLinkService } from '../skip-link.service';

@Directive({
  selector: '[ztpSkipLink]',
})
export class SkipLinkDirective implements OnInit, OnDestroy {
  @Input() state: { skipLink: string; [key: string]: any | undefined };
  private sub: Subscription;

  constructor(
    private el: ElementRef<HTMLElement>,
    private skipLink: SkipLinkService
  ) {}

  ngOnInit() {
    this.sub = this.skipLink.setFocus$
      .pipe(filter((t) => t === this.state.skipLink))
      .subscribe(() => {
        this.el.nativeElement.focus();
      });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
