import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { GraphQLError } from 'graphql';

export const customError401Plugin: ApolloServerPlugin = {
  requestDidStart: () => ({
    willSendResponse({ errors, response }) {
      if (response && response.http) {
        if (
          errors &&
          errors.some(
            (err: GraphQLError) =>
              err.name === 'AuthenticationError' ||
              err.name === 'Unauthorized' ||
              err.message === 'Unauthorized' ||
              err.message ===
                'Response not successful: Received status code 401'
          )
        ) {
          response.data = undefined;
          response.http.status = 401;
        }
      }
    },
  }),
};
