import { gql } from '@apollo/client/core';

export const ALL_TODO_FIELDS = gql`
  fragment todoFields on Todo {
    id
    title
    description
    dueDate
    completed
  }
`;

export const ALL_TODO_NOTE_FIELDS = gql`
  fragment todoNoteFields on TodoNote {
    id
    body
    createdOn
  }
`;

export const ALL_TODOS_QUERY = gql`
  query AllTodos {
    allTodos {
      ...todoFields
    }
  }
  ${ALL_TODO_FIELDS}
`;

export const LOAD_TODO_QUERY = gql`
  query LoadTodo($id: ID!) {
    Todo(id: $id) {
      ...todoFields
    }
  }
  ${ALL_TODO_FIELDS}
`;

export const CREATE_TODO_QUERY = gql`
  mutation CreateTodo($input: NewTodoInput!) {
    newTodo(input: $input) {
      ...todoFields
    }
  }
  ${ALL_TODO_FIELDS}
`;

export const UPDATE_TODO_QUERY = gql`
  mutation UpdateTodo($input: UpdatedTodoInput!) {
    updateTodo(input: $input) {
      ...todoFields
    }
  }
  ${ALL_TODO_FIELDS}
`;

export const REMOVE_TODO_QUERY = gql`
  mutation DeleteTodo($id: ID!) {
    removeTodo(id: $id) {
      id
    }
  }
`;

export const ALL_TODO_NOTES = gql`
  query AllTodoNotes($todoId: ID!) {
    allTodoNotes(todoId: $todoId) {
      ...todoNoteFields
    }
  }
  ${ALL_TODO_NOTE_FIELDS}
`;

export const NEW_TODO_NOTE = gql`
  mutation NewTodoNote($input: NewTodoNoteInput!) {
    newTodoNote(input: $input) {
      ...todoNoteFields
    }
  }
  ${ALL_TODO_NOTE_FIELDS}
`;

export const DELETE_TODO_NOTE = gql`
  mutation DeleteTodoNote($id: ID!) {
    removeTodoNote(id: $id) {
      id
    }
  }
`;
