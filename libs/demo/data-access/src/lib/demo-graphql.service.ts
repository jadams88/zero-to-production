import { Injectable } from '@angular/core';
import { GraphQLService } from '@ztp/common/data-access';

@Injectable({ providedIn: 'root' })
export class DemoGraphQLService extends GraphQLService {
  set graphQLUrl(url: string) {
    this.link.uri = url;
  }
}
