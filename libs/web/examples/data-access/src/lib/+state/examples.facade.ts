import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { IExample } from '@ngw/types';
import { selectCurrentExample, selectAllExamples } from './examples.selectors';
import * as ExampleActions from './examples.actions';

@Injectable()
export class ExamplesFacade {
  examples$: Observable<IExample[]>;
  selectedExample$: Observable<IExample | undefined>;

  constructor(private store: Store<any>) {
    this.examples$ = this.store.pipe(select(selectAllExamples));
    this.selectedExample$ = this.store.pipe(select(selectCurrentExample));
  }

  public addExamples(examples: IExample[]): void {
    this.store.dispatch(ExampleActions.addExamples({ examples }));
  }

  public selectExample(url: string): void {
    this.store.dispatch(ExampleActions.selectExample({ url }));
  }

  public clearSelected(): void {
    this.store.dispatch(ExampleActions.clearSelected());
  }

  public searchStringChanged(search: string) {
    this.store.dispatch(ExampleActions.searchFilter({ search }));
  }
}
