import {
  Component,
  ChangeDetectionStrategy,
  ComponentFactory,
  OnInit,
  Input,
} from '@angular/core';
import { Observable } from 'rxjs';
import { ModuleLoaderService } from '@ztp/common/dynamic-module-loading';

export interface LazyModule {
  key: string;
  [pro: string]: any | undefined;
}

@Component({
  selector: 'ztp-lazy-scrolling',
  templateUrl: './lazy-scrolling.component.html',
  styleUrls: ['./lazy-scrolling.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyScrolling implements OnInit {
  @Input() modules: LazyModule[];

  constructor(private moduleLoader: ModuleLoaderService) {}

  ngOnInit() {
    // Initialize the load of the first module
    if (this.modules.length > 0) {
      this.loadModule(this.modules[0].key);
    }
  }

  selectFactory(key: string): Observable<ComponentFactory<any> | undefined> {
    return this.moduleLoader.selectFactory(key);
  }

  loadModule(key: string) {
    this.moduleLoader.initLoadModule(key);
  }

  trackModule(i: number) {
    return i;
  }
}
