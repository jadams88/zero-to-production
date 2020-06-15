import {
  Component,
  ChangeDetectionStrategy,
  ComponentFactory,
  OnInit,
  Inject,
  Input,
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  ModuleLoaderService,
  LAZY_MODULES,
  ILazyModule,
} from '../module-loader.service';

@Component({
  selector: 'ztp-lazy-viewport',
  templateUrl: './lazy-viewport.component.html',
  styleUrls: ['./lazy-viewport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyViewportComponent implements OnInit {
  @Input() loadThreshold: number;

  constructor(
    @Inject(LAZY_MODULES)
    public modules: ILazyModule[],
    private moduleLoader: ModuleLoaderService
  ) {}

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
