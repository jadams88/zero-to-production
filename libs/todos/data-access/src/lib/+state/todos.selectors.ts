import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  TodosEntityState,
  adapter,
  TodoFilterStatus,
  todosFeatureKey,
} from './todos.reducer';
import { ITodo } from '@ztp/data';
import { isTodoInSearchString, checkStatus } from './todos-filter-functions';

// Select the top level 'todos' state.
export const selectTodoState = createFeatureSelector<TodosEntityState>(
  todosFeatureKey
);

export const {
  selectIds: selectTodoIds,
  selectEntities: selectTodoEntities,
  selectAll: selectAllTodos,
} = adapter.getSelectors(selectTodoState);

export const selectCurrentTodoId = createSelector(
  selectTodoState,
  (state: TodosEntityState) => state.selectedTodoId
);

export const selectLoaded = createSelector(
  selectTodoState,
  (state: TodosEntityState) => state.loaded
);

export const selectTodoFilterStatus = createSelector(
  selectTodoState,
  (state: TodosEntityState) => state.statusFilter
);

export const selectTodoSearchFilter = createSelector(
  selectTodoState,
  (state: TodosEntityState) => state.searchFilter
);

export const selectCurrentTodo = createSelector(
  selectTodoEntities,
  selectCurrentTodoId,
  (todoEntities, todoId) => todoEntities[String(todoId)]
);

export const selectFilteredTodos = createSelector(
  selectAllTodos,
  selectTodoFilterStatus,
  selectTodoSearchFilter,
  (todos: ITodo[], status: TodoFilterStatus, searchString: string | null) => {
    if (status === TodoFilterStatus.All && !searchString) {
      return todos;
    } else {
      const check = checkStatus(status);

      return todos.filter(
        (t) => isTodoInSearchString(searchString, t) && check(t)
      );
    }
  }
);
