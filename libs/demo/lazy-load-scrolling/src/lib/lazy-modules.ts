import { ILazyModule } from '@ztp/common/dynamic-module-loading';

export const MODULES: ILazyModule[] = [
  {
    key: 'lazy-module-one',
    module: () =>
      import('./lazy-module-one/lazy-module-one.module').then(
        (m) => m.LazyModuleOne
      ),
  },
  {
    key: 'lazy-module-two',
    module: () =>
      import('./lazy-module-two/lazy-module-two.module').then(
        (m) => m.LazyModuleTwo
      ),
  },
  {
    key: 'lazy-module-three',
    module: () =>
      import('./lazy-module-three/lazy-module-three.module').then(
        (m) => m.LazyModuleThree
      ),
  },
  {
    key: 'lazy-module-four',
    module: () =>
      import('./lazy-module-four/lazy-module-four.module').then(
        (m) => m.LazyModuleFour
      ),
  },
];
