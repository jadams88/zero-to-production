import { Injectable, ComponentRef, Inject } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { OverlayConfig, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { DynamicFormErrorsMap } from './form-errors';
import mapR from 'ramda/es/map';
import { FormErrorTypes } from './form-errors';
import { FormErrorsComponent } from './form-errors.component';

@Injectable({ providedIn: 'root' })
export class DynamicFormErrorsService {
  constructor(
    @Inject('DYNAMIC_FORM_ERRORS')
    private formErrors: DynamicFormErrorsMap,
    private overlay: Overlay
  ) {}

  createFormErrors() {
    const { overlayRef, componentRef } = this.createOverlay(
      FormErrorsComponent
    );

    componentRef.instance.dismiss.subscribe(() => {
      overlayRef.dispose();
    });
  }

  private createOverlayConfig(): OverlayConfig {
    return {
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically()
    };
  }

  private createOverlay<T>(
    component: ComponentType<T>
  ): {
    overlayRef: OverlayRef;
    componentRef: ComponentRef<T>;
  } {
    const overlayRef = this.overlay.create(this.createOverlayConfig());

    const componentPortal = new ComponentPortal<T>(component);

    const componentRef: ComponentRef<T> = overlayRef.attach(componentPortal);

    // Dispose the overlay ref if the backdrop is clicked
    overlayRef.backdropClick().subscribe(click => {
      overlayRef.dispose();
    });

    return {
      overlayRef,
      componentRef
    };
  }

  createFieldErrors(errors: ValidationErrors) {
    const topLevelKeys = Object.keys(errors);
    const fieldErrors: string[] = [];

    for (let i = 0; i < topLevelKeys.length; i++) {
      const errorsKeys = Object.keys(errors[topLevelKeys[i]]);
      const nestedErrors = reduceErrorKeysToMessages(
        this.formErrors,
        topLevelKeys[i],
        errorsKeys
      );
      fieldErrors.push(...nestedErrors);
    }

    return fieldErrors;
  }
}

function reduceErrorKeysToMessages(
  formErrors: DynamicFormErrorsMap,
  field: string,
  keys: string[]
): string[] {
  return mapR(
    key =>
      `${splitCamelCaseAndUppercaseFirst(field)} ${
        formErrors[key as keyof typeof FormErrorTypes]
      }`,
    keys
  );
}

function splitCamelCaseAndUppercaseFirst(string: string): string {
  return (
    string.substr(0, 1).toUpperCase() +
    string.substr(1, string.length - 1).replace(/[A-Z]/g, c => ' ' + c)
  );
}
