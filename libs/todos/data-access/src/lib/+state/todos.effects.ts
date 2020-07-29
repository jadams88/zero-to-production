import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { logout } from '@ztp/common/auth/data-access';
import { of } from 'rxjs';
import {
  catchError,
  map,
  exhaustMap,
  mergeMap,
  withLatestFrom,
} from 'rxjs/operators';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { ITodo, ITodoNote } from '@ztp/data';
import * as TodoActions from './todos.actions';
import { TodosService } from '../todos.service';
import { TodosFacade } from './todos.facade';

// Note: when merging observable from multiple sources there are 4x operators tha can be uses
// exhaustMap, mergeMap, switchMap and concatMap

// exhaustMap -> ignores subsequent request until the current one has completed
// use when you want the current one to complete. e.g. login or loading initial resources. Ignore everything else until it completes.

// mergeMap -> all effects happen concurrently. Nothing is aborted and all observables complete (or error)
// This is good for action where the order of completion does not matter as they may complete out of time.. i.e. deleting or adding an item.

// switchMap -> switches to the current observable as it. Note that it sends the unsubscribe (and subsequent cancel) to the current observable.
// This is generally not desired for API calls as the current request will be cancelled. i.e. if you spam the delete button the next click will
// cancel the current delete API call. This is undesired.

// concatMap -> merges the observable in the correct order. No observable is ignored and everything runs sequentially. Use this when order matters.

@Injectable()
export class TodoEffects {
  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.loadTodos),
      exhaustMap((action) =>
        this.service.getAllTodos().pipe(
          map(({ errors, data }) =>
            errors
              ? TodoActions.loadTodosFail({ error: errors[0].message })
              : TodoActions.loadTodosSuccess({
                  todos: (data as { allTodos: ITodo[] }).allTodos,
                })
          ),
          catchError((error: HttpErrorResponse) =>
            of(TodoActions.loadTodosFail({ error: error.message }))
          )
        )
      )
    )
  );

  loadTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.loadTodo),
      exhaustMap(({ id }) =>
        this.service.getOneTodo(id).pipe(
          map(({ errors, data }) =>
            errors
              ? TodoActions.loadTodoFail({ error: errors[0].message })
              : TodoActions.loadTodoSuccess({
                  todo: (data as { Todo: ITodo }).Todo,
                })
          ),
          catchError((error: HttpErrorResponse) =>
            of(TodoActions.loadTodoFail({ error: error.message }))
          )
        )
      )
    )
  );

  createTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.createTodo),
      mergeMap(({ todo }) =>
        this.service.createTodo(todo).pipe(
          map(({ errors, data }) =>
            errors
              ? TodoActions.createTodoFail({ error: errors[0].message })
              : TodoActions.createTodoSuccess({
                  todo: (data as { newTodo: ITodo }).newTodo,
                })
          ),
          catchError((error: HttpErrorResponse) =>
            of(TodoActions.createTodoFail({ error: error.message }))
          )
        )
      )
    )
  );

  updateTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.updateTodo),
      mergeMap(({ todo }) =>
        this.service.updateTodo(todo).pipe(
          map(({ errors, data }) =>
            errors
              ? TodoActions.updateTodoFail({ error: errors[0].message })
              : TodoActions.updateTodoSuccess({
                  todo: (data as { updateTodo: ITodo }).updateTodo,
                })
          ),
          catchError((error: HttpErrorResponse) =>
            of(TodoActions.updateTodoFail({ error: error.message }))
          )
        )
      )
    )
  );

  deleteTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.deleteTodo),
      mergeMap(({ todo }) =>
        this.service.deleteTodo(todo.id).pipe(
          map(({ errors, data }) =>
            errors
              ? TodoActions.deleteTodoFail({ error: errors[0].message })
              : TodoActions.deleteTodoSuccess({ id: todo.id })
          ),
          catchError((error: HttpErrorResponse) =>
            of(TodoActions.deleteTodoFail({ error: error.message }))
          )
        )
      )
    )
  );

  createTodoNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.createTodoNote),
      withLatestFrom(this.facade.selectedTodo$),
      mergeMap(([{ body }, todo]) => {
        if (!todo) {
          return of(
            TodoActions.createTodoNoteFail({ error: 'No todo selected' })
          );
        }
        return this.service.createTodoNote(body, todo.id).pipe(
          map(({ errors, data }) =>
            errors
              ? TodoActions.createTodoFail({ error: errors[0].message })
              : TodoActions.createTodoNoteSuccess({
                  note: (data as { newTodoNote: ITodoNote }).newTodoNote,
                })
          ),
          catchError((error: HttpErrorResponse) =>
            of(TodoActions.createTodoNoteFail({ error: error.message }))
          )
        );
      })
    )
  );

  deleteTodoNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.deleteTodoNote),
      withLatestFrom(this.facade.selectedTodo$),
      mergeMap(([{ id }, todo]) => {
        if (!todo) {
          return of(
            TodoActions.deleteTodoNoteFail({ error: 'No todo selected' })
          );
        }
        return this.service.deleteTodoNote(id, todo.id).pipe(
          map(({ errors, data }) =>
            errors
              ? TodoActions.deleteTodoNoteFail({ error: errors[0].message })
              : TodoActions.deleteTodoNoteSuccess({
                  note: (data as { removeTodoNote: ITodoNote }).removeTodoNote,
                })
          ),
          catchError((error: HttpErrorResponse) =>
            of(TodoActions.deleteTodoNoteFail({ error: error.message }))
          )
        );
      })
    )
  );

  // Clear the user todos on logout
  clearTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      map(() => TodoActions.clearTodos())
    )
  );

  constructor(
    private actions$: Actions,
    private service: TodosService,
    private facade: TodosFacade
  ) {}
}
