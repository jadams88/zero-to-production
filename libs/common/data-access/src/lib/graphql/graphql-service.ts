import { Injectable, Inject, InjectionToken } from '@angular/core';
import {
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  ApolloLink,
  concat,
  ApolloClient,
  QueryOptions,
  WatchQueryOptions,
  MutationOptions,
  FetchResult,
  ApolloQueryResult,
} from '@apollo/client/core';
import { Observable, from, observable } from 'rxjs';

export const GRAPHQL_URL = new InjectionToken<string>('GraphQLUrl');

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  private client: ApolloClient<NormalizedCacheObject>;

  constructor(@Inject(GRAPHQL_URL) uri: string) {
    const cache = new InMemoryCache({
      addTypename: true,
    });

    const http = new HttpLink({ uri });

    const removeTypenameMiddleware = new ApolloLink((operation, forward) => {
      if (operation.variables) {
        operation.variables = removeTypenameProperty(operation.variables);
      }
      return forward ? forward(operation) : null;
    });

    this.client = new ApolloClient({
      link: concat(removeTypenameMiddleware, http),
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

  watchQuery<T>(opts: WatchQueryOptions) {
    const queryRef = this.client.watchQuery<T>(opts);
    (queryRef as any)[observable] = () => queryRef;
    return from(queryRef as any) as Observable<ApolloQueryResult<T>>;
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
