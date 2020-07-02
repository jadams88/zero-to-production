import { HttpClient } from '@angular/common/http';
import { print } from 'graphql';
import {
  Operation,
  NextLink,
  FetchResult,
  ApolloLink,
  Observable,
} from '@apollo/client/core';

// https://www.apollographql.com/blog/creating-a-data-component-with-apollo-link-f0719d8193ee
// https://www.apollographql.com/blog/apollo-link-the-modular-graphql-network-stack-3b6d5fcf9244
// https://www.apollographql.com/blog/apollo-link-creating-your-custom-graphql-client-c865be0ce059
// https://www.apollographql.com/docs/link/

// Note that zen-observable (used by apollo client) and rxjs Observable (used by angular/httpClient)
// are not compatible, simply wrap the httpClient request call inside a zen observable.
// This is a simple link to delegate all calls to HttpClient. That way all interceptor are called.
// extend as necessary

export class AngularLink extends ApolloLink {
  opts: { uri: string };
  constructor(opts: { uri: string }, private httpClient: HttpClient) {
    super();
    this.opts = opts;
  }

  request(op: Operation, forward?: NextLink) {
    return new Observable<FetchResult>((observer) => {
      const body = {
        operationName: op.operationName,
        variables: op.variables,
        query: print(op.query),
      };

      const method = 'POST';

      const sub = this.httpClient
        .request<FetchResult>(method, this.opts.uri, {
          observe: 'response',
          responseType: 'json',
          reportProgress: false,
          body,
        })
        .subscribe({
          next: (response) => {
            op.setContext({ response });
            observer.next(response.body as FetchResult);
          },
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });

      return () => {
        if (!sub.closed) sub.unsubscribe();
      };
    });
  }
}
