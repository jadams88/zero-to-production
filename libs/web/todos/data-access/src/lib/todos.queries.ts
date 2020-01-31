import gql from 'graphql-tag';

export const ALL_TODO_PROPERTIES = gql`
  fragment allTodoProperties on Todo {
    id
    title
    description
    completed
  }
`;

export const ALL_TODOS_QUERY = gql`
  {
    allTodos {
      ...allTodoProperties
    }
  }
  ${ALL_TODO_PROPERTIES}
`;

export const LOAD_TODO_QUERY = gql`
  query LoadTodo($id: ID!) {
    Todo(id: $id) {
      ...allTodoProperties
    }
  }
  ${ALL_TODO_PROPERTIES}
`;

export const CREATE_TODO_QUERY = gql`
  mutation CreateTodo($newTodo: NewTodoInput!) {
    newTodo(newTodo: $newTodo) {
      ...allTodoProperties
    }
  }
  ${ALL_TODO_PROPERTIES}
`;

export const UPDATE_TODO_QUERY = gql`
  mutation UpdateTodo($updatedTodo: UpdatedTodoInput!) {
    updateTodo(updatedTodo: $updatedTodo) {
      ...allTodoProperties
    }
  }
  ${ALL_TODO_PROPERTIES}
`;

export const REMOTE_TODO_QUERY = gql`
  mutation DeleteTodo($id: ID!) {
    removeTodo(id: $id) {
      id
    }
  }
`;
