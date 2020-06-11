import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DemoFacade, examples } from '@ztp/demo/data-access';

@Component({
  selector: 'ztp-demo-feature-shell',
  templateUrl: './demo-feature-shell.component.html',
  styleUrls: ['./demo-feature-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoFeatureShellComponent {
  constructor(private facade: DemoFacade) {
    this.facade.addExamples(examples);
  }
}
