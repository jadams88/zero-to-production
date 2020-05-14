### Deploy your API on AWS Lambda

Ensure you have completed all the [prerequisites].

#### Run you Functions locally

Almost all of the heavy lifting of deploying and configuring your [AWS Lambda] functions is taken care of by the [Serverless] framework.

The only configuration that is required before deploying is the `serverless.yml` file located at `apps/server/lambda/serverless.yml`. Change the `service: zero-to-production` field on the first line to whatever you would like your service to be named.

For local testing run the following command to build and serve locally with [serverless-offline]

```bash
ng serve server-lambda
```

#### Deploy to AWS

When you are ready to build and deploy your cloud functions run

```bash
ng run server-lambda:deploy
```

This will build and bundle your application inside the `dist/` directory of the project and then [serverless] will package and deploy your API to AWS Lambda.

Your API URL will be output in the console once successfully deployed.

##### Add environment variables

For your API to function correctly, environment variables must be set. The environment variables can be set one of two ways, either by creating a `.env.production` file in the project directory (`apps/server/lambda/.env.production`), or on the AWS console. If you create an `.env.production` file serverless will auto configure the variables for you.

To add them on AWS, select the deployed service in Functions console.

On the configuration page scroll down to the **Environment Variables** and add the desired variables. For multiline variables, e.g. private/public keys, put all values on one line separated by line break characters e.g.

```bash
### this
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0B...

### becomes
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0B...
```

The environment variables required for the Serverless API are:

- ACCESS_TOKEN_PRIVATE_KEY
- ACCESS_TOKEN_PUBLIC_KEY
- DB_CONNECTION_STRING
- ISSUER
- AUDIENCE

#### Configure Your Custom Domain

Assuming the subdomain of `fns.zero-to-production.dev`

1. Get a a certificate ready with [AWS Certificate Manager].
2. Set up a custom domain name with [API Gateway].

   - Select **REST** and **Regional** for configuration options.
   - Once created add a **Base Path Mapping** to the root path, `/`, and direct it to lambda function.
   - Copy the **Target Domain Name** (needed to set up the DNS records).

3. Configure a **CNAME** record in your DNS provider for the desired subdomain (e.g. `fns` for this demo) and use the **Target Domain Name** as the value for the **CNAME** record.

Once the DNS record propagates you should be able to access your API at the desired subdomain, e.g. `fns.zero-to-production.dev`

#### VPC Network Peering (if using Mongo Atlas)

In a real production server you would setup VPC Network Peering between your Mongo Atlas Project and your AWS Lambda service, however this feature is not available for the free tier cluster.

See the [AWS Lambda Best Practices] & [Mongo VPC Peering] docs on how to set up VPC Network Peering.

#### Additional Notes

If you look at the source code for our Lambda API (`apps/server/lambda`) you will notice the way that the [Mongoose] schemas are defined and referenced differs slightly from the Docker API server.

Defining the schema directly on the mongoose object will cause errors as the schema model will try to 'recompile' each time it is imported. Rather than define schemas on the mongoose import, connect to the database and then define the schemas on the `connection` object.

```typescript
// Regular node server
import mongoose from 'mongoose';

// doing this will cause errors in a serverless environment
const schema = new mongoose.Schema({ name: 'string' });
const User = mongoose.model('User', schema);

// Lambda functions
// Create a single connection
const connection = await mongoose.createConnection(uri);

const schema = new mongoose.Schema({ name: 'string' });
// defined the model on the connection
connection.model('User', schema);

// Get a reference to the model from the connection
const User = connection.model('User');
```

See the documentation on using [Mongoose with AWS Lambda] for further details.

[prerequisites]: https://zero-to-production.dev/guides/getting-started
[aws lambda]: https://aws.amazon.com/lambda
[serverless]: https://serverless.com
[serverless-offline]: https://github.com/dherault/serverless-offline
[aws certificate manager]: https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains-prerequisites.html
[api gateway]: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-regional-api-custom-domain-create.html#create-regional-domain-using-console
[aws lambda best practices]: https://docs.atlas.mongodb.com/best-practices-connecting-to-aws-lambda
[mongo vpc peering]: https://docs.atlas.mongodb.com/security-vpc-peering
[serverless-offline]: https://github.com/dherault/serverless-offline
[mongoose]: https://mongoosejs.com
[mongoose with aws lambda]: https://mongoosejs.com/docs/lambda.html
