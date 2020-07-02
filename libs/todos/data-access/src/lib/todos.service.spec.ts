import { TestBed } from '@angular/core/testing';
import { TodosService } from './todos.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ITodo } from '@ztp/data';
import {
  ALL_TODOS_QUERY,
  LOAD_TODO_QUERY,
  CREATE_TODO_QUERY,
  UPDATE_TODO_QUERY,
  REMOVE_TODO_QUERY,
} from './todos.queries';
import { GraphQLService } from '@ztp/common/data-access';

describe('TodoService', () => {
  let service: TodosService;
  let graphQl: GraphQLService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        TodosService,
        {
          provide: GraphQLService,
          useValue: {
            query: jest.fn(),
            mutate: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject<TodosService>(TodosService);
    graphQl = TestBed.inject(GraphQLService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTodos', () => {
    it('should call the GraphQL service with the allTodos query', () => {
      const spy = jest.spyOn(graphQl, 'query');

      service.getAllTodos();

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({ query: ALL_TODOS_QUERY });

      spy.mockReset();
    });
  });

  describe('getOneTodo', () => {
    it('should call the GraphQL service with the loadTodo query with the todo id', () => {
      const spy = jest.spyOn(graphQl, 'query');

      service.getOneTodo('1');

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({
        query: LOAD_TODO_QUERY,
        variables: { id: '1' },
      });

      spy.mockReset();
    });
  });

  describe('createTodo', () => {
    it('should call the GraphQL service with the newTodo mutation with the todo', () => {
      const spy = jest.spyOn(graphQl, 'mutate');

      const originalTodo: ITodo = {
        userId: '1',
        title: 'some title',
        description: 'some description',
      } as ITodo;

      const sentTodo = {
        ...originalTodo,
        completed: false,
      } as ITodo;

      service.createTodo(originalTodo);

      expect(spy).toHaveBeenCalled();
      // expect(spy).toHaveBeenCalledWith({
      //   mutation: CREATE_TODO_QUERY,
      //   variables: { input: sentTodo },
      //   update: jest.fn()
      // });

      spy.mockReset();
    });
  });

  describe('updateTodo', () => {
    it('should call the GraphQL service with the updateTodo mutation with the updated todo', () => {
      const spy = jest.spyOn(graphQl, 'mutate');

      const updatedTodo: ITodo = {
        id: '1',
        userId: '1',
        title: 'some title',
        description: 'some description',
        dueDate: ('2020-01-01' as unknown) as Date,
        notes: [],
        completed: true,
      };

      service.updateTodo(updatedTodo);

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({
        mutation: UPDATE_TODO_QUERY,
        variables: {
          input: updatedTodo,
        },
      });

      spy.mockReset();
    });
  });

  describe('deleteTodo', () => {
    it('should call the GraphQL service with the removeTodo mutation with the todo id to remove', () => {
      const spy = jest.spyOn(graphQl, 'mutate');

      const todo: ITodo = {
        id: '1',
        userId: '1',
        title: 'some title',
        description: 'some description',
        dueDate: ('2020-01-01' as unknown) as Date,
        notes: [],
        completed: true,
      };

      service.deleteTodo(todo.id);

      expect(spy).toHaveBeenCalled();
      spy.mockReset();
    });
  });
});

// describe('loadTodos', () => {
//   it('should call the api service with /todos', () => {
//     const spy = jest.spyOn(apiService, 'get');

//     service.getAllTodos();

//     expect(spy).toHaveBeenCalled();
//     expect(spy).toHaveBeenCalledWith('todos');

//     spy.mockReset();
//   });
// });

// describe('getTodo', () => {
//   it('should make a GET request to the api server with the resource id', () => {
//     const spy = jest.spyOn(apiService, 'get');

//     service.getOneTodo('1');

//     expect(spy).toHaveBeenCalled();
//     expect(spy).toHaveBeenCalledWith('todos/1');

//     spy.mockReset();
//   });
// });

// describe('createTodo', () => {
//   it('should make a POST request to the api server with the resource to create', () => {
//     const spy = jest.spyOn(apiService, 'post');

//     const todo: Todo = {
//       userId: '1',
//       title: 'some title',
//       description: 'some description',
//       completed: true
//     } as Todo;

//     authService.getDecodedToken = jest.fn(() => {
//       return {
//         sub: '1'
//       } as IJWTPayload;
//     });
//     service.createTodo(todo);

//     expect(spy).toHaveBeenCalled();
//     expect(spy.mock.calls[0][0]).toEqual('todos');
//     expect(spy.mock.calls[0][1]).toEqual(todo);

//     spy.mockReset();
//   });
// });

// describe('updateTodo', () => {
//   it('should make a PUT request to the api server with the resource to update', () => {
//     const spy = jest.spyOn(apiService, 'put');

//     const todo: Todo = {
//       id: '1',
//       userId: '1',
//       title: 'some title',
//       description: 'some description',
//       completed: true
//     };

//     service.updateTodo(todo);

//     expect(spy).toHaveBeenCalled();
//     expect(spy.mock.calls[0][0]).toEqual('todos');
//     expect(spy.mock.calls[0][1]).toEqual(todo);

//     spy.mockReset();
//   });
// });

// describe('deleteTodo', () => {
//   it('should make a DELETE request to the api server with the resource to update', () => {
//     const spy = jest.spyOn(apiService, 'delete');

//     const todo: Todo = {
//       id: '1',
//       userId: '1',
//       title: 'some title',
//       description: 'some description',
//       completed: true
//     };

//     service.deleteTodo(todo.id);

//     expect(spy).toHaveBeenCalled();
//     expect(spy.mock.calls[0][0]).toEqual('todos');
//     expect(spy.mock.calls[0][1]).toEqual(todo.id);

//     spy.mockReset();
//   });
// });
