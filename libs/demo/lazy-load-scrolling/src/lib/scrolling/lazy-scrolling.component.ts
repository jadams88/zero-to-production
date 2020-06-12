import {
  Component,
  ChangeDetectionStrategy,
  ComponentFactory,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ModuleLoaderService } from '@ztp/common/utils/dynamic-module-loading';
import { DemoFacade, IExample } from '@ztp/demo/data-access';
import { Title, Meta } from '@angular/platform-browser';

const lazyModule = [
  {
    key: 'lazy-module-one',
  },
  {
    key: 'lazy-module-two',
  },
];

@Component({
  selector: 'ztp-lazy-scrolling',
  templateUrl: './lazy-scrolling.component.html',
  styleUrls: ['./lazy-scrolling.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyScrolling implements OnInit {
  title = 'Demo - Zero To Production';
  description = 'Advanced Angular demos';
  modules = lazyModule;
  // examples: IExample[];
  // sub: Subscription;

  constructor(
    private facade: DemoFacade,
    private moduleLoader: ModuleLoaderService,
    private titleService: Title,
    private meta: Meta
  ) {
    // this.sub = this.facade.examples$.subscribe((examples) => {
    //   this.examples = examples;
    // });
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.meta.updateTag({ name: 'description', content: this.description });
    this.loadModule(0);
  }

  selectFactory(key: string): Observable<ComponentFactory<any> | undefined> {
    return this.moduleLoader.selectFactory(key);
  }

  loadModule(index: number) {
    const module = this.modules[index];
    // The dynamic form module is NOT lazy loaded
    if (module && module.key !== 'dynamic-form') {
      this.moduleLoader.initLoadModule(module.key);
    }
  }

  trackModule(i: number) {
    return i;
  }

  // ngOnDestroy() {
  //   this.sub.unsubscribe();
  // }
}
