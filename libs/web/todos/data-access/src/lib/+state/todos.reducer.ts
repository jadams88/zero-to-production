import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as TodoActions from './todos.actions';
import { ITodo } from '@ngw/types';
import { TodoFilterStatus } from '@ngw/enums';
import { createReducer, on, Action } from '@ngrx/store';

// 1. define the entity state
export interface TodosEntityState extends EntityState<ITodo> {
  // Add custom property state
  selectedTodoId: string | null;
  statusFilter: TodoFilterStatus;
  searchFilter: string;
}

// 2. Create entity adapter
export const adapter: EntityAdapter<ITodo> = createEntityAdapter<ITodo>();

// 3. Define the initial state
export const initialTodoState: TodosEntityState = adapter.getInitialState({
  selectedTodoId: null,
  statusFilter: TodoFilterStatus.InCompleted,
  searchFilter: ''
});

export const todosReducer = createReducer(
  initialTodoState,
  on(TodoActions.selectTodo, (state, { id }) => {
    return { ...state, selectedTodoId: id };
  }),
  on(TodoActions.clearSelected, state => {
    return { ...state, selectedTodoId: null };
  }),
  on(TodoActions.searchFilter, (state, { search }) => {
    return { ...state, searchFilter: search };
  }),
  on(TodoActions.selectFilter, (state, { filter }) => {
    return { ...state, statusFilter: filter };
  }),
  on(TodoActions.loadTodosSuccess, (state, { todos }) => {
    return adapter.addAll(todos, state);
  }),
  on(TodoActions.createTodoSuccess, (state, { todo }) => {
    return adapter.addOne(todo, state);
  }),
  on(TodoActions.updateTodoSuccess, (state, { todo }) => {
    return adapter.updateOne(todo, state);
  }),
  on(TodoActions.deleteTodoSuccess, (state, { id }) => {
    return adapter.removeOne(id, state);
  })
);

export function reducer(state: TodosEntityState | undefined, action: Action) {
  return todosReducer(state, action);
}
