import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as ExampleActions from './demo.actions';
import { IExample } from '../example.interface';
import * as fromDemo from './demo.reducer';

@Injectable({ providedIn: 'root' })
export class DemoFacade {
  examples$: Observable<IExample[]>;
  selectedExample$: Observable<IExample | undefined>;

  constructor(private store: Store<any>) {
    this.examples$ = this.store.pipe(select(fromDemo.selectAllExamples));
    this.selectedExample$ = this.store.pipe(
      select(fromDemo.selectCurrentExample)
    );
  }

  addExamples(examples: IExample[]): void {
    this.store.dispatch(ExampleActions.addExamples({ examples }));
  }

  selectExample(url: string): void {
    this.store.dispatch(ExampleActions.selectExample({ url }));
  }

  clearSelected(): void {
    this.store.dispatch(ExampleActions.clearSelected());
  }
}
