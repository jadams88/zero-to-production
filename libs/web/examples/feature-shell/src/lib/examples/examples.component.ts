import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { ExamplesFacade } from '@ngw/examples/data-access';
import { IExample } from '@ngw/types';
import { RouterFacade } from '@ngw/data-access/router';

@Component({
  selector: 'ngw-examples',
  templateUrl: './examples.component.html',
  styleUrls: ['./examples.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplesComponent {
  examples$: Observable<IExample[]>;

  constructor(
    private facade: ExamplesFacade,
    private routerFacade: RouterFacade
  ) {
    this.examples$ = this.facade.examples$;
  }

  selectExample(example: IExample) {
    this.facade.selectExample(example.url);
    this.routerFacade.go({ path: [example.url], relative: true });
  }
}
