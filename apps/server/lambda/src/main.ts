import { config } from './environments/environment';
import { connectToDatabase } from './server/db-connection';
import { createHandler } from './server/handler';

// APIGatewayProxyEvent and APIGateway Context
export const handler = async (event: any, ctx: any) => {
  // Set to false to send the response back right away
  // This allows to use the mongo connection between function calls.
  // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
  ctx.callbackWaitsForEmptyEventLoop = false;

  // initialize the db connection
  const con = await connectToDatabase(config.dbConnectionString);
  // create the server
  const http = await createHandler(con);

  const result = await http(event, ctx);
  // and here
  return result;
};
