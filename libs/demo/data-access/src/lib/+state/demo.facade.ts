import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import * as ExampleActions from './demo.actions';
import { IExample } from '../example.interface';
import { Dictionary } from '@ngrx/entity';
import * as fromDemo from './demo.reducer';

@Injectable({ providedIn: 'root' })
export class DemoFacade {
  examples$: Observable<IExample[]>;
  entities$: Observable<Dictionary<IExample>>;

  constructor(private store: Store<any>) {
    this.examples$ = this.store.pipe(select(fromDemo.selectAllExamples));
    this.entities$ = this.store.pipe(select(fromDemo.selectExampleEntities));
  }

  selectExampleById(id: string): Observable<IExample | undefined> {
    return this.entities$.pipe(map((dictionary) => dictionary[id]));
  }

  addExamples(examples: IExample[]): void {
    this.store.dispatch(ExampleActions.addExamples({ examples }));
  }
}
