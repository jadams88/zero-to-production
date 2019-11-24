import curryN from 'ramda/es/curryN';
import equals from 'ramda/es/equals';
import or from 'ramda/es/or';
import toLower from 'ramda/es/toLower';
import { ITodo } from '@ngw/types';
import { TodoFilterStatus } from '@ngw/enums';

function checkTodoCompleteStatus(completeStatus: boolean, todo: ITodo) {
  return equals(completeStatus, todo.completed);
}

export const checkTodoCompleteStatusC = curryN(2, checkTodoCompleteStatus);

export const equalsC = curryN(2, equals);

function isTodoInSearchString(searchString: string, todo: ITodo): boolean {
  return or(
    toLower(todo.title).includes(searchString),
    toLower(todo.description).includes(searchString)
  );
}

export const isTodoInSearchStringC = curryN(2, isTodoInSearchString);

export function todoFilterStatusCheck(filterStatus: TodoFilterStatus) {
  return filterStatus === TodoFilterStatus.Completed;
}
