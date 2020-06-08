import { SchemaDirectiveVisitor } from 'apollo-server-koa';
import { createGraphQLGuards } from '../graphql-guards';
import { createAuthenticateDirective } from './authenticated.directive';
import { createActiveUserDirective } from './active-user.directive';
import { AuthDirectiveName } from './utils';
import { AuthUser, AuthGuard } from '../../types';

/**
 * The AuthDirective use the auth guards. These functions just wrap the resolvers and call them if they don't throw.
 *
 * Because of this the order of function wrapping matters. That is the 'activeUser' must be wrapped by the 'authenticated'
 * guard. How Schema directives are applied at either a type or field level means that they must check each if 'down stream' directives
 * are applied to the field and do NOTHING if they are. The down stream directive will then wrap the resolver with the required guards.
 *
 * e.g. The top level 'Query' field has the '@authenticated' directive applied. All this does is check the Bearer token is valid.
 * If at a later field (or Type), the  '@activeUser` directive is applied, if no checks were done then it would wrap the authenticated
 * middleware, not the other way around as the '@activeUser' middleware requires the '@authenticated' to run first
 */
export function createAuthDirectives<U extends AuthUser>(
  config: AuthGuard<U>
): { [key in AuthDirectiveName]: typeof SchemaDirectiveVisitor } {
  //
  const { authenticate, verifyUser } = createGraphQLGuards(config);

  return {
    [AuthDirectiveName.authenticated]: createAuthenticateDirective(
      authenticate
    ),
    [AuthDirectiveName.activeUser]: createActiveUserDirective(
      authenticate,
      verifyUser
    ),
  };
}
