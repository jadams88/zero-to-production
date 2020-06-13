import { ILazyModule } from '@ztp/common/dynamic-module-loading';

export const MODULES: ILazyModule[] = [
  {
    key: 'lazy-module-one',
    module: () =>
      import('./lazy-module-1/lazy-module-one.module').then(
        (m) => m.LazyModuleOne
      ),
  },
  {
    key: 'lazy-module-two',
    module: () =>
      import('./lazy-module-2/lazy-module-two.module').then(
        (m) => m.LazyModuleTwo
      ),
  },
];
