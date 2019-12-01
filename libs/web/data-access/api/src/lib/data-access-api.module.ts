import { NgModule, ModuleWithProviders } from '@angular/core';
import { GraphQLService } from './graphql/graphql.service';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { createApollo } from './graphql/createApollo';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { ApiService } from './api/api.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule, ApolloModule, HttpLinkModule],
  exports: [HttpClientModule, ApolloModule, HttpLinkModule]
})
export class DataAccessApiModule {
  static forRoot({
    graphQLUrl = 'graphql',
    apiBaseUrl = 'api'
  } = {}): ModuleWithProviders {
    return {
      ngModule: DataAccessApiModule,
      providers: [
        ApiService,
        GraphQLService,
        {
          provide: APOLLO_OPTIONS,
          useFactory: createApollo,
          deps: [HttpLink, 'graphQLUrl']
        },
        {
          provide: 'graphQLUrl',
          useValue: graphQLUrl
        },
        {
          provide: 'apiBaseUrl',
          useValue: apiBaseUrl
        }
      ]
    };
  }
}
