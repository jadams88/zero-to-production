import { ILazyModuleRegistry } from '@ztp/common/utils/dynamic-module-loading';

export const LAZY_MODULES: ILazyModuleRegistry = {
  'form-builder': () =>
    import('@ztp/demo/form-builder').then((m) => m.DemoFormBuilderModule),
  theming: () => import('@ztp/demo/theming').then((m) => m.DemoThemingModule),
  'lazy-scroll': () =>
    import('@ztp/demo/lazy-load-scrolling').then(
      (m) => m.DemoLazyLoadScrollingModule
    ),
  secure: () =>
    import('@ztp/demo/secure-todos').then((m) => m.DemoSecureTodosModule),
  'make-it-your-own': () =>
    import('@ztp/demo/make-it-your-own').then((m) => m.DemoStartYourOwnModule),
};
