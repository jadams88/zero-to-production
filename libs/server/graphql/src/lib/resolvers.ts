// @ts-ignore
import merge from 'lodash.merge';
import { IResolvers } from 'apollo-server-koa';
import { DateResolver, DateTimeResolver, TimeResolver } from 'graphql-scalars';

// A function to add additional Scalar types.
const resolverFunctions = {
  Date: DateResolver,
  Time: TimeResolver,
  DateTime: DateTimeResolver,
};

export function createResolvers(...resolvers: IResolvers[]): IResolvers[] {
  // All the resolvers as an object.
  return merge({}, resolverFunctions, ...resolvers);
}
