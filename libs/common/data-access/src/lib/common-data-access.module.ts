import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TypePolicies } from '@apollo/client/core';
import { ApiService, API_BASE_URL } from './api/api.service';
import {
  GraphQLService,
  GRAPHQL_URL,
  APOLLO_TYPE_POLICIES,
} from './graphql/graphql-service';

// import {
//   WEBSOCKET_URL,
//   SOCKET_IO_NAMESPACE
// } from './websockets/websocket.service';

@NgModule({
  imports: [HttpClientModule],
})
export class CommonDataAccessModule {
  static forRoot(
    {
      graphQLUrl = 'graphql',
      apiBaseUrl = 'api',
      typePolicies,
      // webSocketUrl = '',
      // socketIONamespace = ''
    } = {} as {
      graphQLUrl: string;
      apiBaseUrl: string;
      typePolicies: TypePolicies | undefined;
    }
  ): ModuleWithProviders<CommonDataAccessModule> {
    return {
      ngModule: CommonDataAccessModule,
      providers: [
        ApiService,
        GraphQLService,
        {
          provide: GRAPHQL_URL,
          useValue: graphQLUrl,
        },
        { provide: APOLLO_TYPE_POLICIES, useValue: typePolicies },
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
