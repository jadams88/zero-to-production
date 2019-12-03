import { trigger, transition, style, animate } from '@angular/animations';

export const formErrorsAnimations = trigger('formErrorsAnimations', [
  transition(':enter', [
    style({
      transform: 'translateY(+550px)',
      opacity: 0
    }),
    animate('.2s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ])
]);
