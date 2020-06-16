import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SkipLinkService {
  private _trace: string | undefined;
  private _navLink: string | undefined;
  private _setFocus = new Subject<string>();
  public setFocus$ = this._setFocus.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        const nav = router.getCurrentNavigation();
        this._trace = nav?.extras.state?.trace;
        this._navLink = nav?.extras.state?.navLink;
      }
    });
  }

  get trace() {
    return this._trace;
  }

  get navLink() {
    return this._navLink;
  }

  focusOnLink() {
    if (this.trace) this._setFocus.next(this.trace);
  }
}
