import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AnimationPlayer,
  AnimationMetadata,
  AnimationBuilder,
  style,
  animate,
  keyframes,
  AnimationFactory,
} from '@angular/animations';
import { ScrollDispatcher } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';
import { AnimationService } from '../animation.service';

export enum ElementViewportPosition {
  Above = 'Above',
  On = 'On',
  Below = 'Below',
}

@Directive({
  selector: '[ztpAnimateScrollEntry]',
})
export class AnimateScrollEntryDirective implements OnInit, OnDestroy {
  player: AnimationPlayer;
  previousPosition: ElementViewportPosition;
  animationCompleted = true;
  animate = false;

  private sub: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platform: Object,
    private el: ElementRef,
    private builder: AnimationBuilder,
    private scrollDispatcher: ScrollDispatcher,
    private animationService: AnimationService
  ) {
    this.sub = this.animationService.enabled$.subscribe((enabled) => {
      this.animate = enabled;
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platform)) {
      this.checkCurrentPosition();
      this.registerScrollDispatcher();
    }
  }

  private checkCurrentPosition() {
    // There should only be one parent
    const [scrollAncestor] = this.scrollDispatcher.getAncestorScrollContainers(
      this.el
    );

    if (scrollAncestor) {
      const elRef = scrollAncestor.getElementRef().nativeElement as HTMLElement;

      const clientTop = elRef.clientTop;
      const clientHeight = elRef.clientHeight;
      const offsetTop = elRef.offsetTop;

      const currentPosition = this.elementScrollPosition(
        this.el,
        clientTop + offsetTop,
        clientHeight + offsetTop
      );

      if (currentPosition === ElementViewportPosition.On) {
        this.playAnimation(this.flipInto());
      }

      this.previousPosition = currentPosition;
    }
  }

  private registerScrollDispatcher() {
    this.sub.add(
      this.scrollDispatcher
        .ancestorScrolled(this.el, 100)
        .subscribe((scrolled) => {
          if (scrolled) {
            const elRef = scrolled.getElementRef().nativeElement as HTMLElement;

            const clientTop = elRef.clientTop;
            const clientHeight = elRef.clientHeight;
            const offsetTop = elRef.offsetTop;

            const newPosition = this.elementScrollPosition(
              this.el,
              clientTop + offsetTop,
              clientHeight + offsetTop
            );

            const oldPosition = this.previousPosition;

            // Only play a new animation if the old has stopped playing
            if (this.animationCompleted) {
              // Only play the intro animation if the old position was below the current viewport
              // i.e. scrolling up.
              if (
                oldPosition === ElementViewportPosition.Below &&
                newPosition === ElementViewportPosition.On
              ) {
                this.playAnimation(this.flipInto());

                // Only hide if the new position is below the viewport
                // if it is above, keep its current state
              } else if (
                oldPosition === ElementViewportPosition.On &&
                newPosition === ElementViewportPosition.Below
              ) {
                this.playAnimation(this.opacity(0));
              }

              this.previousPosition = newPosition;
            }
          }
        })
    );
  }

  private playAnimation(metadata: AnimationMetadata[]) {
    if (this.player) {
      this.player.destroy();
    }

    let factory: AnimationFactory;
    if (this.animate === false) {
      factory = this.builder.build(this.opacity(1));
    } else {
      factory = this.builder.build(metadata);
    }

    this.player = factory.create(this.el.nativeElement);

    // register an onDone function to toggle the state once it is completed
    this.player.onDone(() => (this.animationCompleted = true));

    this.animationCompleted = false;
    this.player.play();
  }

  private flipInto(): AnimationMetadata[] {
    // sudo random number between 0 and 0.5
    const delay = (Math.random() / 4).toFixed(2);
    const timing = (0.5 + Math.random() / 2).toFixed(2);
    const sequence = `${timing}s ${delay}s cubic-bezier(.37,.63,.31,.9)`;
    return [
      animate(
        sequence,
        keyframes([
          style({
            opacity: 0,
            transform:
              'translate3d(0, 200%, -20em) scale3d(0.2, 0.2, 0.2) rotateX(720deg)',
          }),
          style({
            opacity: 0.25,
            transform:
              'translate3d(0, 120%, -18em) scale3d(0.4, 0.4, 0.4) rotateX(540deg)',
          }),
          style({
            opacity: 0.5,
            transform:
              'translate3d(0, 60%, -16em) scale3d(0.6, 0.6, 0.6) rotateX(360deg)',
          }),
          style({
            opacity: 0.75,
            transform:
              'translate3d(0, 20%, -10em) scale3d(0.8, 0.8, 0.8) rotateX(180deg)',
          }),
          style({
            opacity: 1,
            transform: 'none',
          }),
        ])
      ),
    ];
  }

  private opacity(op: number): AnimationMetadata[] {
    return [style({ opacity: op })];
  }

  /**
   * Determines if an element is within the current view port
   *
   * @param el
   * @param topY
   * @param bottomY
   */
  elementScrollPosition(
    el: ElementRef,
    topY: number,
    bottomY: number
  ): ElementViewportPosition {
    const rect: DOMRect = el.nativeElement.getBoundingClientRect();
    if (rect.top < bottomY && rect.bottom > topY) {
      return ElementViewportPosition.On;
    } else if (rect.top > bottomY && rect.bottom > topY) {
      return ElementViewportPosition.Below;
    } else {
      return ElementViewportPosition.Above;
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
