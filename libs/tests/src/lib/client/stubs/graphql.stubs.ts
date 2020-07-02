import { Observable, of } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client';
import { FetchResult } from 'apollo-link';
import { GraphQLError } from 'graphql';

// The network status is an enum with 7 all ok.
// https://github.com/apollographql/@apollo/client/blob/master/packages/@apollo/client/src/core/networkStatus.ts

export class GraphQLStub {
  private expectedResponse: ApolloQueryResult<any> | undefined;

  setExpectedResponse<T>(data: T): void {
    this.expectedResponse = {
      data,
      loading: false,
      networkStatus: 7,
    };
  }

  setErrorResponse(errors: GraphQLError[]): void {
    this.expectedResponse = {
      data: null,
      errors,
      loading: false,
      networkStatus: 7,
    };
  }

  // Use for debugging only
  getExpectedResponse() {
    return this.expectedResponse;
  }

  query<T>(
    query: string,
    variables?: any
  ): Observable<ApolloQueryResult<T> | undefined> {
    return of<ApolloQueryResult<T> | undefined>(this.expectedResponse);
  }

  mutate<T>(
    query: string,
    variables: any
  ): Observable<FetchResult<T> | undefined> {
    return of<ApolloQueryResult<T> | undefined>(this.expectedResponse);
  }
}
