import Koa from 'koa';
import { ITodo } from '@ztp/data';
import { authConfig } from '../../../environments/index';
import { schema } from '../../graphql';
import ApiServer from '../../server';
import { createGraphQLSpec } from '@ztp/tests/server';
import { Todo } from './todo.model';
import { User } from '../users';

// Need to import and run the server because
// the server is also our "auth server"
// and the Auth guard needs to be able to retrieve the JWKS
const server = new ApiServer(new Koa());

const todo = {
  title: 'Some Todo',
  description: 'A todo that needs to be done',
} as ITodo;

const updatedTodo = {
  completed: true,
};

createGraphQLSpec(
  schema,
  { ...authConfig.accessToken, keyId: 'keyId' },
  server,
  /*userResource */ true
)(Todo, 'Todo', todo, updatedTodo, User);
