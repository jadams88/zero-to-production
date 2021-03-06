import { TestBed } from '@angular/core/testing';
import { TodoEffects } from './todos.effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { hot, cold } from 'jest-marbles';
import * as TodoActions from './todos.actions';
import { TodosService } from '../todos.service';
import { ITodo } from '@ztp/data';
import { createSpyObj } from '@ztp/tests/client';
import { GraphQLError } from 'graphql';
import { TodosFacade } from './todos.facade';

describe('TodoEffects', () => {
  let effects: TodoEffects;
  let action$: Observable<any>;
  let todoService: TodosService;
  let facade: TodosFacade;
  let mockTodo: ITodo;
  const todoServiceSpy = createSpyObj('TodoService', [
    'loadTodos',
    'getTodo',
    'createTodo',
    'updateTodo',
    'deleteTodo',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TodoEffects,
        { provide: TodosService, useValue: todoServiceSpy },
        { provide: TodosFacade, useValue: {} },
        provideMockActions(() => action$),
      ],
    });
    effects = TestBed.inject<TodoEffects>(TodoEffects);
    action$ = TestBed.inject<Actions>(Actions);
    todoService = TestBed.inject<TodosService>(TodosService);
    facade = TestBed.inject<TodosFacade>(TodosFacade);
    mockTodo = {
      id: '1',
      userId: '1',
      title: 'some title',
      description: 'some description',
      dueDate: ('2020-01-01' as unknown) as Date,
      notes: [],
      completed: true,
    };
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loadTodos$', () => {
    it('should return a LoadTodoSuccess action with a payload of todos', () => {
      const todos: ITodo[] = [
        {
          id: '1',
          userId: '1',
          title: 'some title',
          description: 'some description',
          dueDate: ('2020-01-01' as unknown) as Date,
          notes: [],
          completed: true,
        },
        {
          id: '2',
          userId: '1',
          title: 'another title',
          description: 'another description',
          dueDate: ('2020-01-01' as unknown) as Date,
          notes: [],
          completed: false,
        },
      ];

      const action = TodoActions.loadTodos();
      const completion = TodoActions.loadTodosSuccess({ todos });

      action$ = hot('-a-', { a: action });
      const response = cold('-a|', { a: { data: { allTodos: todos } } });
      const expected = cold('--b', { b: completion });

      todoService.getAllTodos = jest.fn(() => response);

      expect(effects.loadTodos$).toBeObservable(expected);
    });

    it('should return a LoadTodosFail action if the service throws', () => {
      const error = new GraphQLError('An error occurred');
      const action = TodoActions.loadTodos();
      const completion = TodoActions.loadTodosFail({ error: error.message });

      action$ = hot('-a--', { a: action });
      const response = cold('-a|', { a: { errors: [error] } });
      const expected = cold('--b', { b: completion });

      todoService.getAllTodos = jest.fn(() => response);

      expect(effects.loadTodos$).toBeObservable(expected);
    });
  });

  describe('createTodo$', () => {
    it('should return a CreateTodoSuccess action with a payload of the created Todo', () => {
      const action = TodoActions.createTodo({ todo: mockTodo });
      const completion = TodoActions.createTodoSuccess({ todo: mockTodo });

      action$ = hot('-a-', { a: action });
      const response = cold('-a|', { a: { data: { newTodo: mockTodo } } });
      const expected = cold('--b', { b: completion });

      todoService.createTodo = jest.fn(() => response);

      expect(effects.createTodo$).toBeObservable(expected);
    });

    it('should return a CreateTodoFail action if the service throws', () => {
      const error = new GraphQLError('An error occurred');
      const action = TodoActions.createTodo({ todo: mockTodo });
      const completion = TodoActions.createTodoFail({ error: error.message });

      action$ = hot('-a--', { a: action });
      const response = cold('-a|', { a: { errors: [error] } });
      const expected = cold('--b', { b: completion });

      todoService.createTodo = jest.fn(() => response);

      expect(effects.createTodo$).toBeObservable(expected);
    });
  });

  describe('updateTodo$', () => {
    it('should return a UpdateTodoSuccess action with a payload of the updated Todo', () => {
      const action = TodoActions.updateTodo({ todo: mockTodo });
      const completion = TodoActions.updateTodoSuccess({
        todo: mockTodo,
      });

      action$ = hot('-a-', { a: action });
      const response = cold('-a|', { a: { data: { updateTodo: mockTodo } } });
      const expected = cold('--b', { b: completion });

      todoService.updateTodo = jest.fn(() => response);

      expect(effects.updateTodo$).toBeObservable(expected);
    });

    it('should return a UpdateTodoFail action if the service throws', () => {
      const error = new GraphQLError('An error occurred');
      const action = TodoActions.updateTodo({ todo: mockTodo });
      const completion = TodoActions.updateTodoFail({ error: error.message });

      action$ = hot('-a--', { a: action });
      const response = cold('-a|', { a: { errors: [error] } });
      const expected = cold('--b', { b: completion });

      todoService.updateTodo = jest.fn(() => response);

      expect(effects.updateTodo$).toBeObservable(expected);
    });
  });

  describe('deleteTodo$', () => {
    it('should return a DeleteTodoSuccess action with a payload of the deleted Todo', () => {
      const action = TodoActions.deleteTodo({ todo: mockTodo });
      const completion = TodoActions.deleteTodoSuccess({ id: mockTodo.id });

      action$ = hot('-a-', { a: action });
      const response = cold('-a|', { a: { data: { removeTodo: mockTodo } } });
      const expected = cold('--b', { b: completion });

      todoService.deleteTodo = jest.fn(() => response);

      expect(effects.deleteTodo$).toBeObservable(expected);
    });

    it('should return a DeleteTodoFail action if the service throws', () => {
      const error = new GraphQLError('An error occurred');
      const action = TodoActions.deleteTodo({ todo: mockTodo });
      const completion = TodoActions.deleteTodoFail({ error: error.message });

      action$ = hot('-a--', { a: action });
      const response = cold('-a|', { a: { errors: [error] } });
      const expected = cold('--b', { b: completion });

      todoService.deleteTodo = jest.fn(() => response);

      expect(effects.deleteTodo$).toBeObservable(expected);
    });
  });
});
