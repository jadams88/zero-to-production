import { Injectable, Inject, InjectionToken, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { ApolloClient } from '@apollo/client/core';
import {
  InMemoryCache,
  NormalizedCacheObject,
  TypePolicies,
} from '@apollo/client/cache';
import { ApolloLink, concat, FetchResult } from '@apollo/client/link/core';
import type {
  QueryOptions,
  WatchQueryOptions,
  MutationOptions,
} from '@apollo/client/core';

import { AngularLink } from './angular-link';

export const GRAPHQL_URL = new InjectionToken<string>('GraphQLUrl');
export const APOLLO_TYPE_POLICIES = new InjectionToken<
  TypePolicies | undefined
>('Apollo Client TypePolicies');

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  private client: ApolloClient<NormalizedCacheObject>;
  protected link: AngularLink;

  constructor(
    private httpClient: HttpClient,
    @Inject(GRAPHQL_URL) uri: string,
    @Optional()
    @Inject(APOLLO_TYPE_POLICIES)
    typePolicies: TypePolicies | undefined
  ) {
    const cache = new InMemoryCache({
      addTypename: true,
      typePolicies,
    });

    this.link = new AngularLink({ uri }, this.httpClient);

    const removeTypenameMiddleware = new ApolloLink((operation, forward) => {
      if (operation.variables) {
        operation.variables = removeTypenameProperty(operation.variables);
      }
      return forward ? forward(operation) : null;
    });

    this.client = new ApolloClient({
      link: concat(removeTypenameMiddleware, this.link),
      cache,
      connectToDevTools: false,
    });
  }

  getClient() {
    return this.client;
  }

  query<T>(opts: QueryOptions) {
    return from(this.client.query<T>(opts));
  }

  mutate<T>(opts: MutationOptions) {
    return from(this.client.mutate(opts)) as Observable<FetchResult<T>>;
  }

  watchQuery<T>(opts: WatchQueryOptions): Observable<FetchResult<T>> {
    const watchQ = this.client.watchQuery<T>(opts);

    // wrap the watchQuery result in an rxjs observable
    return new Observable<FetchResult<T>>((observer) => {
      const sub = watchQ.subscribe({
        next: (query) => observer.next(query),
        error: (e) => observer.error(e),
        complete: () => observer.complete(),
      });

      return () => {
        if (!sub.closed) sub.unsubscribe();
      };
    });
  }
}

/**
 * Utility function to remove the '__typename' property that apollo cache created
 * @param variables the query variables to cleanse
 *
 * https://github.com/apollographql/apollo-feature-requests/issues/6
 */
function removeTypenameProperty(value: any): any {
  if (value === null || value === undefined) {
    return value;
  } else if (Array.isArray(value)) {
    return value.map((v) => removeTypenameProperty(v));
  } else if (typeof value === 'object') {
    const newObj: any = {};
    Object.entries(value).forEach(([key, v]) => {
      if (key !== '__typename') {
        newObj[key] = removeTypenameProperty(v);
      }
    });
    return newObj;
  }
  return value;
}
