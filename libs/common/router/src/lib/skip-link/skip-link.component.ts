import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Inject,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { SkipLinkService } from '../skip-link.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'ztp-router-skip-link',
  templateUrl: './skip-link.component.html',
  styleUrls: ['./skip-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterSkipLinkComponent implements OnDestroy {
  _previousNav = false;
  _active = true;
  private sub: Subscription;
  trace = '';

  @Input()
  set active(active: boolean | undefined) {
    if (active !== undefined) {
      this._active = active;
      this.triggerFocusLink();
    }
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private skipLink: SkipLinkService,
    private cd: ChangeDetectorRef
  ) {
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const navigation = this.router.getCurrentNavigation();
        // Check if it has navigated before, this is to prevent focus on first load
        if (this._previousNav) {
          this.triggerFocusLink();
        } else if (navigation?.previousNavigation) {
          this._previousNav = true;
        } else {
          this._previousNav = false;
        }
      });
  }

  triggerFocusLink() {
    const trace = this.skipLink.trace;
    if (this._active && this._previousNav && trace) {
      this.trace = trace;

      const skipLink = this.document.querySelector('#skip-link') as HTMLElement;
      if (skipLink) {
        skipLink.focus();
        this.cd.markForCheck();
      }
    }
  }

  revertFocus() {
    this.skipLink.focusOnLink();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
