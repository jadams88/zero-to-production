import { Injectable } from '@angular/core';
import * as RouterActions from './router.actions';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { Store, select } from '@ngrx/store';
import {
  selectQueryParams,
  selectRouteParams,
  selectRouteParam,
  selectQueryParam,
  selectRouteData,
  selectUrl
} from './router.selector';
import { RouterNavigate } from './router.actions';

@Injectable({ providedIn: 'root' })
export class RouterFacade {
  queryParams$: Observable<Params>;
  routerParams$: Observable<Params>;
  routerData$: Observable<any>;
  url$: Observable<string>;

  constructor(private store: Store<any>) {
    this.queryParams$ = this.store.pipe(select(selectQueryParams));
    this.routerParams$ = this.store.pipe(select(selectRouteParams));
    this.routerData$ = this.store.pipe(select(selectRouteData));
    this.url$ = this.store.pipe(select(selectUrl));
  }

  go(go: RouterNavigate) {
    this.store.dispatch(RouterActions.navigate({ nav: go }));
  }

  navigateForward() {
    this.store.dispatch(RouterActions.navigateForward());
  }

  navigateBackward() {
    this.store.dispatch(RouterActions.navigateBack());
  }

  selectParam(param: string): Observable<string | undefined> {
    return this.store.pipe(select(selectRouteParam(param)));
  }

  selectQueryParam(param: string): Observable<string | undefined> {
    return this.store.pipe(select(selectQueryParam(param)));
  }

  updateUrl(url: string) {
    this.store.dispatch(RouterActions.updateUrl({ url }));
  }
}
