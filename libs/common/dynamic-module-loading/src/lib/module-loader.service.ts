import {
  Injectable,
  Injector,
  Type,
  Compiler,
  ComponentFactory,
  NgModuleFactory,
  InjectionToken,
  Inject,
} from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, distinctUntilChanged, take } from 'rxjs/operators';

export type TModuleImportPath = () => Promise<NgModuleFactory<any> | Type<any>>;

interface IModuleRegistry {
  importPath: TModuleImportPath;
  loadInitiated: boolean;
  loadComplete: boolean;
}

interface IFactoryRegistry {
  [key: string]: { factory: ComponentFactory<any> } | undefined;
}

export interface ILazyModule {
  key: string;
  module: TModuleImportPath;
}

export const LAZY_MODULES = new InjectionToken<ILazyModule[]>(
  'LAZY_MODULE_REGISTRY'
);

// If you provide the dependency at the root injector 'providedIn:"root"', then
// you need to provide the LAZY_MODULE_REGISTRY injection token at the root level as well.
// It is up to you to determine your use case, but for this example I chose to provide the DI Token
// In a lazy loaded module, hence not in root injector
@Injectable()
export class ModuleLoaderService {
  private moduleLoaded = new Subject<string>();
  public moduleLoaded$ = this.moduleLoaded.asObservable();

  private _registry: Map<string, IModuleRegistry> = new Map();
  private registry: BehaviorSubject<IFactoryRegistry> = new BehaviorSubject({});

  private registry$ = this.registry.asObservable();

  constructor(
    @Inject(LAZY_MODULES)
    modules: ILazyModule[],
    private compiler: Compiler,
    private injector: Injector
  ) {
    // Register the providers in the internal map
    this.registerModule(modules);
  }

  selectFactory(tag: string): Observable<ComponentFactory<any> | undefined> {
    return this.registry$.pipe(
      map((registry) => registry[tag]),
      distinctUntilChanged(),
      map((module) => (module && module.factory ? module.factory : undefined))
    );
  }

  private registerModule(modules: ILazyModule[]): void {
    modules.forEach((module) => {
      const register: IModuleRegistry = {
        importPath: module.module,
        loadComplete: false,
        loadInitiated: false,
      };
      this._registry.set(module.key, register);
    });

    // Object.keys(modules).forEach((key) => {
    //   const moduleRegister: IModuleRegistry = {
    //     importPath: modules[key],
    //     loadComplete: false,
    //     loadInitiated: false,
    //   };
    //   this._registry.set(key, moduleRegister);
    // });
  }

  public async initLoadModule(key: string): Promise<boolean> {
    const registeredModule = this._registry.get(key);

    if (!registeredModule) {
      throw new Error(
        `Unrecognized module "${key}". Make sure it is registered in the module registry`
      );
    }

    // Only initiate the import if it has not already
    if (!registeredModule.loadInitiated) {
      registeredModule.loadInitiated = true;

      const path = registeredModule.importPath;

      try {
        // Load the module from the server by executing the import statement
        const elementModule = await path();
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

        if (!entryComponent) {
          throw new Error(
            `No entry component defined. a static 'lazyEntryComponent' ` +
              `must be defined on ${moduleFactory.moduleType}`
          );
        }

        const moduleRef = moduleFactory.create(this.injector);
        // Now we have an instance of the componentFactory to use
        const factory = moduleRef.componentFactoryResolver.resolveComponentFactory(
          entryComponent
        );

        registeredModule.loadComplete = true;
        this.registerFactory(key, factory);
        return true;
      } catch (err) {
        // console.error('error loading module', err);
        return false;
      }
    } else {
      return true;
    }
  }

  private registerFactory(key: string, factory: ComponentFactory<any>) {
    this.registry$.pipe(take(1)).subscribe((registry) => {
      const registryClone = { ...registry };
      registryClone[key] = { factory };
      this.registry.next(registryClone);
      this.moduleLoaded.next(key);
    });
  }
}
