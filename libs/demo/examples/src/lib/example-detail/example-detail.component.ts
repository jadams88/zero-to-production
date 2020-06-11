import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IExample, DemoFacade } from '@ztp/demo/data-access';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'ztp-example-detail',
  templateUrl: './example-detail.component.html',
  styleUrls: ['./example-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleDetailComponent {
  example$: Observable<IExample | undefined>;
  constructor(private router: ActivatedRoute, private facade: DemoFacade) {
    this.router.paramMap.pipe(
      tap(console.log),
      map((params) => params.get('example'))
    );

    this.example$ = this.facade.selectedExample$;
  }
}
