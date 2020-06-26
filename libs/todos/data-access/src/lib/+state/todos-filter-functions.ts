import { ITodo } from '@ztp/data';
import { TodoFilterStatus } from './todos.reducer';

export function isTodoInSearchString(
  searchString: string | null,
  todo: ITodo
): boolean {
  if (searchString === null) {
    return true;
  } else {
    if (todo.title === '' || todo.description === '') {
      return false;
    } else {
      const s = searchString.toLowerCase();
      return (
        todo.title.toLowerCase().includes(s) ||
        todo.description.toLowerCase().includes(s)
      );
    }
  }
}

export function checkStatus(status: TodoFilterStatus) {
  const r = status === TodoFilterStatus.Completed;
  return (t: ITodo) => t.completed === r;
}
