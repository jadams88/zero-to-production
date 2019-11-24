import { createFeatureSelector, createSelector } from '@ngrx/store';
import compose from 'ramda/es/compose';
import isEmpty from 'ramda/es/isEmpty';
import and from 'ramda/es/and';
import allPass from 'ramda/es/allPass';
import filter from 'ramda/es/filter';
import { TodosEntityState, adapter } from './todos.reducer';
import { ITodo } from '@ngw/types';
import { TodoFilterStatus } from '@ngw/enums';
import {
  equalsC,
  checkTodoCompleteStatusC,
  todoFilterStatusCheck,
  isTodoInSearchStringC
} from './todos-filter-functions';

// Select the top level 'todos' state.
export const selectTodoState = createFeatureSelector<TodosEntityState>(
  'todosState'
);

export const {
  selectIds: selectTodoIds,
  selectEntities: selectTodoEntities,
  selectAll: selectAllTodos
} = adapter.getSelectors(selectTodoState);

export const selectCurrentTodoId = createSelector(
  selectTodoState,
  (state: TodosEntityState) => state.selectedTodoId
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
    const filterStatusCheck = equalsC(status);

    if (and(filterStatusCheck(TodoFilterStatus.All), isEmpty(searchString))) {
      return todos;
    } else {
      const statusCheck = compose(
        checkTodoCompleteStatusC,
        todoFilterStatusCheck
      );
      return filter(
        allPass([isTodoInSearchStringC(searchString), statusCheck(status)]),
        todos
      );
    }
  }
);
