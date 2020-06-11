import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import * as ExampleActions from './demo.actions';
import { IExample } from '../example.interface';
// import { Dictionary } from '@ngrx/entity';
import * as fromDemo from './demo.reducer';

@Injectable({ providedIn: 'root' })
export class DemoFacade {
  examples$: Observable<IExample[]>;
  selectedExample$: Observable<IExample | undefined>;
  // entities$: Observable<Dictionary<IExample>>;

  constructor(private store: Store<any>) {
    this.examples$ = this.store.pipe(select(fromDemo.selectAllExamples));
    this.selectedExample$ = this.store.pipe(
      select(fromDemo.selectCurrentExample)
    );
    this.selectedExample$.subscribe(console.log);
    // this.entities$ = this.store.pipe(select(fromDemo.selectExampleEntities));
  }

  // selectExampleById(id: string): Observable<IExample | undefined> {
  //   return this.entities$.pipe(map((dictionary) => dictionary[id]));
  // }

  addExamples(examples: IExample[]): void {
    this.store.dispatch(ExampleActions.addExamples({ examples }));
  }

  selectExample(id: string): void {
    this.store.dispatch(ExampleActions.selectExample({ id }));
  }

  clearSelected(): void {
    this.store.dispatch(ExampleActions.clearSelected());
  }
}
