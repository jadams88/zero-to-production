import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Input,
  OnChanges,
  OnInit,
  ViewContainerRef,
  ComponentFactory,
  Inject
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  FormGroupTypes,
  TField,
  DynamicFormComponentMap
} from '../dynamic-form.models';

@Directive({
  selector: '[appDynamicFormField]'
})
export class DynamicFormFieldDirective implements OnInit, OnChanges {
  @Input() idx: number | undefined;
  @Input() type!: FormGroupTypes;
  @Input() field!: TField;
  @Input() group!: FormGroup;
  component!: ComponentRef<any>;

  constructor(
    @Inject('DYNAMIC_FORM_COMPONENT_MAP')
    private componentMap: DynamicFormComponentMap,
    private resolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    let component: ComponentFactory<any>;

    if (this.field.customComponent) {
      component = this.resolver.resolveComponentFactory<any>(
        this.field.customComponent
      );
    } else {
      component = this.resolver.resolveComponentFactory<any>(
        this.componentMap[this.field.componentType]
      );
    }

    this.viewContainerRef.clear();
    this.component = this.viewContainerRef.createComponent(component);

    this.setInstanceProperties();
  }

  ngOnChanges() {
    if (this.component) {
      this.setInstanceProperties();
    }
  }

  setInstanceProperties() {
    this.component.instance.type = this.type;
    this.component.instance.field = this.field;
    this.component.instance.group = this.group;
    this.component.instance.idx = this.idx;
  }
}
