import {
  Directive,
  ViewContainerRef,
  Input,
  ComponentFactory,
  ComponentRef,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[ztpFactoryRenderer]',
})
export class ComponentFactorRendererDirective implements OnDestroy {
  private componentRef: ComponentRef<any> | undefined;

  constructor(private viewContainerRef: ViewContainerRef) {}

  @Input()
  set componentFactory(factory: ComponentFactory<any> | null | undefined) {
    if (factory) {
      this.viewContainerRef.clear();
      this.componentRef = this.viewContainerRef.createComponent(factory);
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
