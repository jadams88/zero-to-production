import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { GraphQLService } from '@ztp/common/data-access';
import { FetchResult } from 'apollo-link';
import { ITodo, ITodoNote } from '@ztp/data';
import { ApolloUtilsService, GraphQLService } from '@ztp/common/data-access';
import {
  ALL_TODOS_QUERY,
  LOAD_TODO_QUERY,
  CREATE_TODO_QUERY,
  UPDATE_TODO_QUERY,
  REMOVE_TODO_QUERY,
  ALL_TODO_NOTES,
  NEW_TODO_NOTE,
  DELETE_TODO_NOTE,
} from './todos.queries';

@Injectable({ providedIn: 'root' })
export class TodosService {
  constructor(
    private graphQL: GraphQLService,
    private utils: ApolloUtilsService
  ) {}

  public getAllTodos(): Observable<FetchResult<{ allTodos: ITodo[] }>> {
    return this.graphQL.query<{ allTodos: ITodo[] }>({
      query: ALL_TODOS_QUERY,
    });
  }

  public getOneTodo(id: string): Observable<FetchResult<{ Todo: ITodo }>> {
    return this.graphQL.query<{ Todo: ITodo }>({
      query: LOAD_TODO_QUERY,
      variables: { id },
    });
  }

  public createTodo(todo: ITodo): Observable<FetchResult<{ newTodo: ITodo }>> {
    const todoToSave: ITodo = { ...todo, completed: false };
    // set the completed state to false
    const variables = { input: todoToSave };

    // Add the new Todo to the Apollo Cache 'allTodos' after create
    return this.graphQL.mutate<{ newTodo: ITodo }>({
      mutation: CREATE_TODO_QUERY,
      variables,
      update: this.utils.addToQueryCache(
        ALL_TODOS_QUERY,
        'newTodo',
        'allTodos'
      ),
    });
  }

  public updateTodo(
    updatedTodo: ITodo
  ): Observable<FetchResult<{ updateTodo: ITodo }>> {
    const variables = { input: updatedTodo };

    return this.graphQL.mutate<{ updateTodo: ITodo }>({
      mutation: UPDATE_TODO_QUERY,
      variables,
    });
  }

  public deleteTodo(
    id: string
  ): Observable<FetchResult<{ removeTodo: { id: string } }>> {
    const variables = { id };

    // Remove the todo from the apollo cache
    return this.graphQL.mutate<{ removeTodo: { id: string } }>({
      mutation: REMOVE_TODO_QUERY,
      variables,
      update: this.utils.removeFromQueryCache(
        ALL_TODOS_QUERY,
        'removeTodo',
        'allTodos'
      ),
    });
  }

  public allTodoNotesQueryRef(todoId: string): Observable<ITodoNote[]> {
    return this.graphQL
      .query<{ allTodoNotes: ITodoNote[] }>({
        query: ALL_TODO_NOTES,
        variables: { todoId },
      })
      .pipe(map((result) => (result.data ? result.data.allTodoNotes : [])));
  }

  public createTodoNote(
    body: string,
    todoId: string
  ): Observable<FetchResult<{ newTodoNote: ITodoNote }>> {
    const variables = {
      input: {
        todoId,
        body,
      },
    };
    // Add the new Todo to the Apollo Cache 'allTodos' after create
    return this.graphQL.mutate<{ newTodoNote: ITodoNote }>({
      mutation: NEW_TODO_NOTE,
      variables,
      update: this.utils.addToQueryCache(
        ALL_TODO_NOTES,
        'newTodoNote',
        'allTodoNotes',
        { todoId },
        /*front*/ true
      ),
    });
  }

  public deleteTodoNote(
    id: string,
    todoId: string
  ): Observable<FetchResult<{ removeTodoNote: ITodoNote }>> {
    const variables = { id };
    // Add the new Todo to the Apollo Cache 'allTodos' after create
    return this.graphQL.mutate<{ removeTodoNote: ITodoNote }>({
      mutation: DELETE_TODO_NOTE,
      variables,
      update: this.utils.removeFromQueryCache(
        ALL_TODO_NOTES,
        'removeTodoNote',
        'allTodoNotes',
        { todoId }
      ),
    });
  }
}

// ------------------------------------------
// The below functions can be used if you would
// like to use REST based API calls
// ------------------------------------------

// public getAllTodos(): Observable<Todo[]> {
//   return this.api.get<Todo[]>(`todos`);
// }

// public getOneTodo(id: string): Observable<Todo> {
//   return this.api.get<Todo>(`todos/${id}`);
// }

// public createTodo(todo: Todo): Observable<Todo> {
//   // Set the user id of the current JWT id
//   todo.user = this.auth.getDecodedToken().sub;
//   return this.api.post<Todo>('todos', todo);
// }

// public updateTodo(todo: Todo): Observable<Todo> {
//   return this.api.put<Todo>('todos', todo);
// }

// public deleteTodo(todo: Todo): Observable<Todo> {
//   return this.api.delete<Todo>('todos', todo.id);
// }
