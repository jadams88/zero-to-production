import { ILazyModuleRegistry } from '@ztp/common/utils/dynamic-module-loading';

export const LAZY_MODULES: ILazyModuleRegistry = {
  'lazy-module-one': () =>
    import('./lazy-module-1/lazy-module-one.module').then(
      (m) => m.LazyModuleOne
    ),
  'lazy-module-two': () =>
    import('./lazy-module-2/lazy-module-two.module').then(
      (m) => m.LazyModuleTwo
    ),
};
