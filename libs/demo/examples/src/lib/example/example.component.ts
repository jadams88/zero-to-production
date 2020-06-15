import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { IExample, DemoFacade } from '@ztp/demo/data-access';
import { tap, map, switchMap } from 'rxjs/operators';
import { RouterFacade } from '@ztp/common/router';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';

@Component({
  selector: 'ztp-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  examples$: Observable<IExample[]>;
  selectedExample$: Observable<IExample | undefined>;

  constructor(
    private facade: DemoFacade,
    private routerFacade: RouterFacade,
    private router: Router
  ) {
    this.examples$ = this.facade.examples$;

    this.selectedExample$ = this.routerFacade.url$.pipe(
      map((fullUrl) => this.splitUrl(fullUrl)),
      tap((url) =>
        url ? this.facade.selectExample(url) : this.facade.clearSelected()
      ),
      switchMap(() => this.facade.selectedExample$)
    );
  }

  splitUrl(fullUrl: string): string | undefined {
    const regEx = /(?<=\/examples\/)(?<example>(\w|-)+)/;
    const url = regEx.exec(fullUrl);
    if (url && url.groups) {
      return url.groups.example;
    }
  }

  creteLibUrl(path: string) {
    return (
      'https://github.com/jonathonadams/zero-to-production/tree/master/' + path
    );
  }

  exampleChanged(change: MatSelectChange) {
    this.router.navigate(['examples', change.value]);
  }
}
