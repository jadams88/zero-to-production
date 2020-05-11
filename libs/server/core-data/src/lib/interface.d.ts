import { GraphQLFieldResolver } from 'graphql';
import { SchemaTypeOpts, Schema, SchemaType } from 'mongoose';

export type TResolverAuthGuard = (
  resolver: GraphQLFieldResolver<any, any, any>
) => GraphQLFieldResolver<any, any, any>;

/**
 * Type safety guards for any mongoose schema
 */
// create a schema type of properties of the instance interface
type TSchemaFields<T> = {
  [key in keyof T]: SchemaTypeOpts<any> | Schema | SchemaType;
};

// Schema definition first converts all optional fields to required `Required<TSchemaFields<T>>`
// Then Omits the 'id' field as that does not have to be defined
type TSchemaDefinition<T> = Omit<Required<TSchemaFields<T>>, 'id' | '_id'>;
