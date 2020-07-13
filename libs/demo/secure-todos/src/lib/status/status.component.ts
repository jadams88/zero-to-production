import { Component, Input } from '@angular/core';

@Component({
  selector: 'ztp-api-status',
  template: `
    <div class="status-pulse">
      <span class="pulse" [ngClass]="color"></span>
      <span class="dot" [ngClass]="color"></span>
    </div>
  `,
  styleUrls: ['./status.component.scss'],
})
export class DemoApiStatusComponent {
  @Input() set status(st: boolean | null | undefined) {
    this.color = this.statusToColor(st);
  }
  color = 'yellow';

  statusToColor(status: boolean | null | undefined) {
    switch (status) {
      case false:
        return 'red';
      case true:
        return 'green';
      case null:
      case undefined:
        return 'yellow';
      default:
        return 'yellow';
    }
  }
}
