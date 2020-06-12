import { Component } from '@angular/core';

@Component({
  selector: 'lazy-component-1',
  templateUrl: './lazy-component-two.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 400px;
      }
    `,
  ],
})
export class LazyComponentTwo {
  constructor() {
    console.log('im lazy');
  }
}
