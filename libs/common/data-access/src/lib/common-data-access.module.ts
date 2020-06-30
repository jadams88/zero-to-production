import { NgModule, ModuleWithProviders } from '@angular/core';
// import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
// import { createApollo, GRAPHQL_URL } from './graphql/createApollo';
// import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { ApiService, API_BASE_URL } from './api/api.service';
import { HttpClientModule } from '@angular/common/http';
import { GraphQLService, GRAPHQL_URL } from './graphql/graphql-service';

// import {
//   WEBSOCKET_URL,
//   SOCKET_IO_NAMESPACE
// } from './websockets/websocket.service';

@NgModule({
  imports: [HttpClientModule],
})
export class CommonDataAccessModule {
  static forRoot({
    graphQLUrl = 'graphql',
    apiBaseUrl = 'api',
    // webSocketUrl = '',
    // socketIONamespace = ''
  } = {}): ModuleWithProviders<CommonDataAccessModule> {
    return {
      ngModule: CommonDataAccessModule,
      providers: [
        ApiService,
        GraphQLService,
        // {
        //   provide: APOLLO_OPTIONS,
        //   useFactory: createApollo,
        //   deps: [HttpLink, GRAPHQL_URL],
        // },
        {
          provide: GRAPHQL_URL,
          useValue: graphQLUrl,
        },
        {
          provide: API_BASE_URL,
          useValue: apiBaseUrl,
        },
        // {
        //   provide: WEBSOCKET_URL,
        //   useValue: webSocketUrl
        // },
        // {
        //   provide: SOCKET_IO_NAMESPACE,
        //   useValue: socketIONamespace
        // }
      ],
    };
  }
}
