import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { IExample, DemoFacade } from '@ztp/demo/data-access';
import { tap, map, filter, switchMap } from 'rxjs/operators';
import { RouterFacade } from '@ztp/common/router';

@Component({
  selector: 'ztp-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  example$: Observable<IExample | undefined>;

  constructor(private router: RouterFacade, private facade: DemoFacade) {
    this.example$ = this.router.url$.pipe(
      map((fullUrl) => fullUrl.split('/').pop()),
      filter((url) => url !== undefined),
      tap((url) => this.facade.selectExample(url as string)),
      switchMap(() => this.facade.selectedExample$)
    );
  }
}
