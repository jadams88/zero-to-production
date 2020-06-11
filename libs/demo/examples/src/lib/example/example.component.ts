import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { IExample, DemoFacade } from '@ztp/demo/data-access';
import { ActivatedRoute } from '@angular/router';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'ztp-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  example$: Observable<IExample | undefined>;

  constructor(private router: ActivatedRoute, private facade: DemoFacade) {
    this.router.paramMap
      .pipe(
        tap(console.log),
        map((params) => params.get('example'))
      )
      .subscribe((example) => console.log(example));

    this.example$ = this.facade.selectedExample$;

    this.example$.subscribe(console.log);
  }
}
