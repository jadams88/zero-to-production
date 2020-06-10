import { GraphQLField, defaultFieldResolver, GraphQLObjectType } from 'graphql';
import { SchemaDirectiveVisitor } from 'apollo-server-koa';
import {
  checkAppliedDirectives,
  TAuthResolver,
  DirectiveWrapped,
  AuthDirectiveName,
} from './utils';

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
export function createAuthenticateDirective(
  authenticate: TAuthResolver
): typeof SchemaDirectiveVisitor {
  /**
   * The 'AuthenticatedDirective' wraps resolvers with the 'authenticated' middleware.
   *
   * Downstream directives to check for: 'activeUser'
   */
  class AuthenticateDirective extends SchemaDirectiveVisitor {
    visitObject(type: GraphQLObjectType) {
      // Check if the Type has previously been applied
      // Mark the GraphQLObjectType object to avoid re-wrapping:
      if ((type as any)[DirectiveWrapped.auth]) return;
      (type as any)[DirectiveWrapped.auth] = true;

      // Check if the @activeUser directive has been applied, and return if it has
      if (checkAppliedDirectives(type, [AuthDirectiveName.isActiveUser])) {
        return;
      }

      // For each field, call the 'visitFieldDefinition'
      const fields = type.getFields();
      Object.keys(fields).forEach((fieldName) => {
        const field: GraphQLField<any, any> = fields[fieldName];
        this.visitFieldDefinition(field);
      });
    }

    visitFieldDefinition(field: GraphQLField<any, any>) {
      // Check if the field has previously been applied
      // Mark the GraphQLField to avoid re-wrapping:
      if ((field as any)[DirectiveWrapped.auth]) return;
      (field as any)[DirectiveWrapped.auth] = true;

      // Check if the @activeUser directive has been applied, and return if it has
      if (checkAppliedDirectives(field, [AuthDirectiveName.isActiveUser])) {
        return;
      }

      // Get the individual field resolver if there is one,
      const { resolve = defaultFieldResolver } = field;
      const next = resolve.bind(this);

      // and wrap with the 'authenticate' field
      field.resolve = authenticate(next);
    }
  }

  return AuthenticateDirective;
}
