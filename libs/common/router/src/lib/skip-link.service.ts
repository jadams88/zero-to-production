import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SkipLinkService {
  private _trace: string | undefined;
  private _setFocus = new Subject<string>();
  public setFocus$ = this._setFocus.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        const navigation = router.getCurrentNavigation();
        this._trace = navigation?.extras.state?.skipLink;
      }
    });
  }

  get trace() {
    return this._trace;
  }

  focusOnLink() {
    if (this.trace) this._setFocus.next(this.trace);
  }
}
