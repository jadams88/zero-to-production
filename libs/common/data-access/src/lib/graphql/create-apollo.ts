import { InjectionToken } from '@angular/core';
// import { HttpLink } from 'apollo-angular-link-http';
import {
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  ApolloLink,
  concat,
  ApolloClientOptions,
} from '@apollo/client/core';
// import ApolloClient from 'apollo-client';
// import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
// import { ApolloLink, concat } from 'apollo-link';
// import { ApolloClientOptions } from 'apollo-client';

export const GRAPHQL_URL = new InjectionToken<string>('GraphQLUrl');

// Currently set cache to be ignored, change this as required
export function createApollo(
  httpLink: HttpLink,
  uri: string
): ApolloClientOptions<NormalizedCacheObject> {
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

  return {
    link: concat(removeTypenameMiddleware, http),
    cache,
    connectToDevTools: false,
  };
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
