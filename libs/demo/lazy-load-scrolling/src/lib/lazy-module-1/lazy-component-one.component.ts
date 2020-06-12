import { Component } from '@angular/core';

@Component({
  selector: 'lazy-component-1',
  templateUrl: './lazy-component-one.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 400px;
      }
    `,
  ],
})
export class LazyComponentOne {
  constructor() {
    console.log('im lazy');
  }
}
