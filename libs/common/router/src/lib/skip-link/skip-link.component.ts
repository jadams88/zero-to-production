import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SkipLinkService } from './skip-link.service';

@Component({
  selector: 'ztp-router-skip-link',
  templateUrl: './skip-link.component.html',
  styleUrls: ['./skip-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterSkipLinkComponent implements OnDestroy {
  _nav = false;
  _active = true;
  private sub: Subscription;
  trace: string = '';

  @ViewChild('skipLink', { static: true }) skipLink: ElementRef<
    HTMLButtonElement
  >;

  @Input()
  set active(active: boolean | undefined) {
    if (active !== undefined) this._active = active;
  }

  @Input() navLink: string | undefined;

  constructor(
    private router: Router,
    private service: SkipLinkService,
    private cd: ChangeDetectorRef
  ) {
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.previousNavigation !== null) {
          if (this._nav === false) this._nav = true;

          const trace = this.service.trace;
          if (trace) this.trace = trace;

          const navLink = this.service.navLink;

          if (this._active && this.navLink === navLink) {
            this.skipLink.nativeElement.focus();
            this.cd.markForCheck();
          }
        }
      });
  }

  revertFocus() {
    this.service.focusOnLink();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
