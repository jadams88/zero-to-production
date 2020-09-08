import { SchemaDirectiveVisitor } from 'apollo-server-koa';
import formatDate from 'date-fns/format';
import {
  defaultFieldResolver,
  GraphQLString,
  GraphQLField,
  GraphQLArgument,
} from 'graphql';

export class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;
    // the default format is defined as format on the type definition
    const { format: defaultFormat } = this.args;

    field.args.push({
      name: 'format',
      type: GraphQLString,
    } as GraphQLArgument);

    field.resolve = async function (source, { format, ...rest }, ctx, info) {
      const date = await resolve.call(this, source, rest, ctx, info);
      return formatDate(date, format || defaultFormat);
    };

    field.type = GraphQLString;
  }
}
