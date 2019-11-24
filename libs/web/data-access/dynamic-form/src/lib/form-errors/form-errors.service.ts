import { Injectable, ComponentRef } from '@angular/core';
import { OverlayConfig, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class FormErrorsService {
  constructor(private overlay: Overlay) {}

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

  createOverlay<T>(
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
}
