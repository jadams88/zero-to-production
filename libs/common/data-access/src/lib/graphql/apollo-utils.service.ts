import { Injectable } from '@angular/core';
import { DocumentNode } from 'graphql';
import { MutationUpdaterFn } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class ApolloUtilsService {
  addToQueryCache = (
    query: DocumentNode,
    queryResult: string,
    queryName: string,
    variables?: any,
    front = false
  ): MutationUpdaterFn => {
    return (store, { data }) => {
      if (data) {
        const queryDate = data[queryResult];

        const cache = store.readQuery({
          query,
          variables,
        }) as any;

        if (cache && cache[queryName]) {
          const update = front
            ? [queryDate, ...cache[queryName]]
            : [...cache[queryName], queryDate];

          store.writeQuery({
            query,
            variables,
            data: { [queryName]: update },
          });
        }
      }
    };
  };

  removeFromQueryCache = (
    query: DocumentNode,
    queryResult: string,
    queryName: string,
    variables?: any
  ): MutationUpdaterFn => {
    return (store, { data }) => {
      if (data) {
        const queryDate = data[queryResult];

        const cache = store.readQuery({
          query,
          variables,
        }) as any;

        if (cache && cache[queryName]) {
          const newCache = (cache[queryName] as any[]).filter(
            (val) => val.id !== queryDate.id
          );

          store.writeQuery({
            query,
            variables,
            data: { [queryName]: newCache },
          });
        }
      }
    };
  };
}
