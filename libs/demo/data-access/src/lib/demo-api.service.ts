import { Injectable } from '@angular/core';
import { ApiService } from '@ztp/common/data-access';

@Injectable({ providedIn: 'root' })
export class DemoApiService extends ApiService {
  set apiUrl(url: string) {
    this.baseUrl = url;
  }

  get apiUrl() {
    return this.baseUrl;
  }
}
