import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ApiService, GraphQLService } from '@ztp/common/data-access';
import { DemoApiService, DemoGraphQLService } from '@ztp/demo/data-access';
import { timer, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, catchError, map } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'ztp-select-api',
  templateUrl: './select-api.component.html',
  styleUrls: ['./select-api.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectApiComponent implements OnInit {
  servers = [
    {
      label: 'Google Cloud Kubernetes',
      url: 'https://api.zero-to-production.dev',
    },
    {
      label: 'AWS Lambda',
      url: 'https://fns.zero-to-production.dev',
    },
  ];

  selected: string;

  k8sStatus$: Observable<boolean>;
  awsStatus$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private gql: GraphQLService
  ) {
    [this.k8sStatus$, this.awsStatus$] = this.servers.map((s) =>
      this.pingForStatus(s.url)
    );
  }

  ngOnInit() {
    const baseUrl = (this.api as DemoApiService).apiUrl;
    // remove the leading '/api' from the string
    this.selected = baseUrl.substr(0, baseUrl.length - 4);
  }

  pingForStatus(url: string): Observable<boolean> {
    return timer(1000, 10000).pipe(
      switchMap(() =>
        this.http.get(`${url}/healthz`, { responseType: 'text' }).pipe(
          map(() => true),
          catchError((e) => of(false))
        )
      )
    );
  }

  statusText(st: boolean | any): string {
    return st === true ? 'Online' : st === false ? 'Offline' : 'Pending';
  }

  selectApi(evt: MatSelectChange) {
    (this.api as DemoApiService).apiUrl = `${evt.value}/api`;
    (this.gql as DemoGraphQLService).graphQLUrl = `${evt.value}/graphql`;
  }
}
