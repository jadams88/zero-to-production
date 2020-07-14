import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ApiService, GraphQLService } from '@ztp/common/data-access';
import { DemoApiService, DemoGraphQLService } from '@ztp/demo/data-access';
import { timer, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, catchError, map } from 'rxjs/operators';

@Component({
  selector: 'ztp-select-api',
  templateUrl: './select-api.component.html',
  styleUrls: ['./select-api.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectApiComponent {
  k8s = 'https://api.zero-to-production.dev';
  aws = 'https://fns.zero-to-production.dev';

  selected: string;

  k8sStatus$: Observable<boolean>;
  awsStatus$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private gql: GraphQLService
  ) {
    this.k8sStatus$ = this.pingForStatus(this.k8s);
    this.awsStatus$ = this.pingForStatus(this.aws);
  }

  ngOnInit() {
    const baseUrl = (this.api as DemoApiService).apiUrl;
    // remove the leading '/api' from the string
    this.selected = baseUrl.substr(0, baseUrl.length - 4);
  }

  pingForStatus(url: string): Observable<boolean> {
    return timer(1000, 3000).pipe(
      switchMap(() =>
        this.http.get(`${url}/healthz`, { responseType: 'text' }).pipe(
          map(() => true),
          catchError((e) => of(false))
        )
      )
    );
  }

  selectApi(url: string) {
    (this.api as DemoApiService).apiUrl = `${url}/api`;
    (this.gql as DemoGraphQLService).graphQLUrl = `${url}/graphql`;
  }
}
