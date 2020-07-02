import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { print } from 'graphql';
import {
  Operation,
  NextLink,
  FetchResult,
  ApolloLink,
  Observable as ZenObservable,
} from '@apollo/client/core';

export class AngularLink extends ApolloLink {
  opts: { uri: string };
  constructor(opts: { uri: string }, private httpClient: HttpClient) {
    super();
    this.opts = opts;
  }

  request(op: Operation, forward?: NextLink) {
    return new ZenObservable<FetchResult>((observer) => {
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
        if (!sub.closed) {
          sub.unsubscribe();
        }
      };
    });
  }
}
