export const moduleProviders = `// lazy-modules.ts
export const MODULES: ILazyModule[] = [
  { 
    key: 'form-builder',
    module: () => import('@ztp/demo/form-builder').then(m => m.DemoFormBuilderModule)
  }
   ...
};

// demo-feature-shell.module.ts
@NgModule({
  ...
  providers: [
    {
      provide: LAZY_MODULES,
      useValue: MODULES,
    }
  ]
})
export class DemoFeatureShellModule {}
`;

export const moduleLoadingService = `// lazy-load.service.ts
@Injectable({
  providedIn: 'root'
})
export class ModuleLoaderService {
  constructor(
    @Inject(LAZY_MODULE_REGISTRY) registry: ILazyModuleRegistry,
    private compiler: Compiler,
    private injector: Injector
  ) {}

  public async initLoadModule(key: string): Promise<any> {
    const modulePath = this.registry[key];

    // Load the module from the server by executing the import statement
    const elementModule = await modulePath();
    
    let moduleFactory: NgModuleFactory<any>;
    if (elementModule instanceof NgModuleFactory) {
        // AOT Compilation
        moduleFactory = elementModule;
    } else {
        // JIT Compilation
        moduleFactory = await this.compiler.compileModuleAsync(elementModule);
    }

    // 'lazyEntryComponent' is a getter on the Module definition
    // that returns the Component to act as the entry component. e.g.
    //
    // export class DemoFormBuilderModule {
    //   static get lazyEntryComponent() {
    //      return ExampleFormBuilderOverviewComponent;
    //   }
    // }
    const entryComponent = (<any>moduleFactory.moduleType)
        .lazyEntryComponent;

    const moduleRef = moduleFactory.create(this.injector);
    // Now we have an instance of the componentFactory to use
    const factory = moduleRef.componentFactoryResolver.resolveComponentFactory(
        entryComponent
    );
    
    // DO SOMETHING WITH THE COMPONENT FACTORY
    ...
  }  
}`;
