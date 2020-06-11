# Authentication Library for Node.js Servers

This library contains all services and guards required to authenticate, authorize and secure both REST and GraphQL API's. Authentication is achieved using [JSON Web Tokens](https://jwt.io/).

The library is decoupled from the database used so each resource model must be provided and satisfy the respective type guards, i.e. the `User` model provided must satisfy the `AuthUserModel` interface as shown below.

```TypeScript
// User model
export interface AuthUserModel<U extends AuthUser> {
  new (user: any): U;
  findByUserId(id: string | undefined): Promise<U | null>;
  findByUsername(username: string): Promise<U | null>;
  findByEmail(email: string): Promise<U | null>;
}

// User instance
export interface AuthUser {
  id?: string | number;
  username: string;
  email: string;
  active: boolean;
  isVerified: boolean;
  hashedPassword?: string | undefined;
  save(): Promise<this>;
}
```

`findByUserId`, `findByUsername` and `findByEmail` are required static methods on the model and `save` is an instance method.

An example of as Mongoose.js User model is provided at the end.

For additional Resource types, please see `src/lib/types.d.ts`

## Configuration

The lib can be configured in one of four ways.

- **BasicAuth**: User login and registration without email verification.
- **BasicAuthAndRefresh**: Basic auth that includes additional routes that enable issuing and revoking refresh tokens when logging in (not supported with GraphQL)
- **AuthWithValidation**: Basic auth with email verification when registering.
- **CompleteAuth**: Basic auth that include email verification and supports refresh tokens.

A utility function is provided to generate the required configuration.

```TypeScript
import { generateAuthModuleConfig } from '@ztp/server/auth';
import { authEnv } from '@environments';
import { User } from '../api/users';
import { VerificationToken, RefreshToken } from './models';

// Basic AuthModule (no email verification)
const basicAuthModuleConfig = generateAuthModuleConfig(authEnv, User);

// Complete auth config with email verification and refresh tokens
const authModuleConfig = generateAuthModuleConfig(
  authEnv,
  User,
  VerificationToken,
  verifyEmail,
  RefreshToken
);
```

See below for the required configuration options.

The email verification handler provided takes the email address and verification token as arguments and returns a promise that resolves when sent.

```TS
type VerifyEmail = (email: string, token: string) => Promise<any>;
```

### Environment Config

The required environment configuration takes the following shape.

```TS
interface AuthEnv {
  authServerHost: string; // the host of the authentication server
  jwksRoute?: boolean; // if to include a JWKS route, see below
  accessToken: { // short lived access token options
    privateKey: string;
    publicKey?: string;
    expireTime: number;
    issuer: string;
    audience: string;
  };
  refreshToken?: { // long lived refresh token options
    privateKey: string;
    publicKey?: string;
    issuer: string;
    audience: string;
  };
}
```

## Usage

### REST / Router

```TS
import Koa from 'koa';
import { generateAuthModuleConfig } from '@ztp/server/auth';

const app = new Koa();

// options as above
const authModuleConfig = generateAuthModuleConfig(
  authEnv,
  User,
  VerificationToken,
  verifyEmail,
  RefreshToken
);

// return Router middleware
const authRoutes = applyAuthRoutes(authModuleConfig)

app.use(authRoutes)
```

The routes that will be applied are as follows:

Basic Auth:

- **POST** - `/login`: returns short live access token when user successfully logs in.
- **POST** - `/register`: registers a new user and returns the newly created user.
- **GET** - `/available`: returns the availability status given username.

If including email verification:

- **GET** - `/verify` : verify the newly registered user via email.

If including refresh tokens:

- **POST** - `/authorize`: returns an access token and refresh token.
- **POST** - `/authorize/refresh`: returns a new access token if a valid refresh token is provided.
- **POST** - `/authorize/revoke`: revokes the provided refresh token.

Optional

- **GET** - `/.well-known/jwks.json` JSON Web Key Set that hosts the access token public key (see below).

### GraphQL

```TS
import { ApolloServer } from 'apollo-server-koa';
import { generateAuthModuleConfig } from '@ztp/server/auth';


// options as above
const authModuleConfig = generateAuthModuleConfig(
  authEnv,
  User,
  VerificationToken,
  verifyEmail
);

/**
 * Auth Schema: all queries and mutation do NOT require to be authorized
 */
export const authSchema = createAuthSchema(authModuleConfig);

// do whatever you want with your schema.
const apolloServer = new ApolloServer({schema: authSchema})
```

The Authentication Schema will create the following Queries and Mutations:

Basic Auth:

- **Query** - `userAvailable(username: String!): UserAvailable!`: userAvailable(username: String!): UserAvailable!
- **Mutation** - `register(input: RegisterInput!): RegisterSuccess!`: registers a new user and returns the newly created user.
- **Mutation** - `login(username: String!, password: String!): AuthPayload!`: returns short live access token when user successfully logs in.

If including email verification:

- **Query** - `verify(email: String!, token: String!): VerifyUser!` : verify the newly registered user via email.

Note: although the `verify` query should technically be a mutation (it will update the user `isVerified` property), GraphQL does not allow `Mutations` to be made via a `GET` request. Hence it is a `Query` so that it can be executed via an email link.

## RS256 Private / Pub Key pair

The JWT use RS256 private/public key pair for signing and validating the tokens. Providing the public key is optional and will be generated if not provided.

### JSON Web Key Set (Optional)

If `jwksRoute` is set to true for the environment variable a [JSON Web Key Set(JWKS)](https://auth0.com/docs/tokens/concepts/jwks) will be served at `/.well-known/jwks.json`. This allows any service that required the public key for validating tokens can retrieve the key from the authentication server via the JWKS. The public key does not need to be deployed and is auto rotated if a new private/public key set is deployed.

## Auth Guards

The library provided a set of authentication middleware guards as well as authentication resolvers and directives for GraphQL.

Guards
`authenticate`: verifies the provided JWT.
`verifyIsActive`: verifies the user is currently active (reads the user from the DB)

Both the Router and GraphQL authentication guards are expecting the JWT to exists on `ctx.token`. Middleware should be used to add the `Bearer` token from the `Authorization` header to the `ctx` object.

```TS
import Koa from 'koa';
import { ApolloServer } from 'apollo-server-koa';

const app = new Koa();

app.use(async (ctx) => {
  const token = //... retrieve token from `Authorization header
  ctx.token = token;
})
```

And add the token property to the Apollo context object

```TS
const apollo = new ApolloServer({
  schema,
  ...,
  context: ({ctx}) => {
    return {
      state:{}
      token: ctx.token
    }
  }
})
```

#### JWKS Guard

The `authenticate` guard can function in one of two ways. If the public key is provided to the guard it will use it for validating tokens. If it not provided, the guard will retrieve the public key from a JWKS hosted on the provided auth server.

### Usage

```TS
import { generateAuthGuardConfig } from '@ztp/server/auth';
import { User } from '../api/users';

// interface for the auth guards
export interface AuthGuardConfig {
  authServerHost: string;
  accessToken: {
    publicKey?: string;
    issuer: string;
    audience: string;
  };
}

const authEnv: AutGuardConfig = {
  ...
}

const guardConfig = generateAuthGuardConfig(authEnv, User);

/**
 * Guards for use in Routes
 */
export const {
  authenticate: routeAuthGuard,
  verifyIsActive: routeIsActiveGuard,
} = getRestGuards(guardConfig);

/**
 * Guards to user with GraphQL Resolvers
 */
export const {
  authenticate: resolverAuthGuard,
  verifyIsActive: resolverIsActiveGuard,
} = getGraphQLGuards(guardConfig);
```

### Router Guard

```TS
// Router
import Router from '@koa/router';
import {
  routeAuthGuard,
  routeIsActiveGuard
} from './auth-guards';

const router = new Router({
  prefix: '/api',
});

// Global check to ensure token is valid
// secures all subsequent routes
router.use(routeAuthGuard);

// protect individual route
router.get('/users', routerIsActive, async ctx => ... )
```

## GraphQL

### Resolver Guard

```TS
import {
  resolverAuthGuard,
  resolverIsActiveGuard
} from './auth-guards';

const getOneUser = async (parent, args, ctx, info) => {
  // ...
}

const getAllUsers = async (parent, args, ctx, info) => {
  // ...
}

const userQueries {
  Query: {
    // validate JWT
    allUsers: resolverAuthGuard(getAllUsers),
    // Check user is active
    User: resolverIsActiveGuard(getOneUser)
  },
};
```

### Directives

The auth guards are also available as schema directives. Add the directives to the `ApolloServer` constructor.

```TS
import { ApolloServer } from 'apollo-server-koa';
import { createAuthDirectives } from '@ztp/server/auth';

const authDirectives = createAuthDirectives(guardConfig);

const schema = // ...

const apollo = new ApolloServer({schema, schemaDirective: authDirective })

```

Then declare the directives on the schema and add to the desired field or object.

GraphQL Schema:

```GraphQL
# declare the directives
directive @authenticate on OBJECT | FIELD_DEFINITION
directive @isActiveUser on OBJECT | FIELD_DEFINITION

# This will wrap every field on the 'Query' and 'Mutation' type, i.e. every query
type Query @authenticate
type Mutation @authenticate

schema {
  query: Query
  mutation: Mutation
}
```

The directives will authenticate every request to decorated fields.

Note: In the example above the directives have been applied to the`Query` and `Mutation` type. This will wrap every field of those types (i.e. every query). This may not be desired, i.e. the authentication quires and mutations. Schema stitching can be used to authenticate entire 'sub' schemas and leave others unauthenticated.

## Example Mongoose.js User Model

```TypeScript
import { model } from 'mongoose';

interface IUser {
  id: string;
  username: string;
  email: string;
  active: boolean;
  isVerified: boolean;
  hashedPassword?: string;
}

interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {
  findByUsername(username: string): Promise<IUserDocument | null>;
  findByEmail(username: string): Promise<IUserDocument | null>;
  findByUserId(id: string | undefined): Promise<IUserDocument | null>;
}

// Configure as necessary, i.e unique email and don't query the hashedPassword by default
const userSchema = new Schema<IUser>(
  {
    username: String,
    email: String,
    active: Boolean,
    isVerified: Boolean,
    hashedPassword: String
  }
);

class UserClass extends Model {
  static findByUsername(username: string): Promise<IUserDocument | null> {
    return this.findOne({
      username,
    })
      .select('+hashedPassword')
      .exec();
  }

  static findByEmail(email: string): Promise<IUserDocument | null> {
    return this.findOne({
      email,
    }).exec();
  }

  static findByUserId(id: string | undefined): Promise<IUserDocument | null> {
    return super.findById(id).exec();
  }
}

userSchema.loadClass(UserClass);

export const User = model<IUserDocument, IUserModel>('user', userSchema);
```

## Running unit tests

Run `ng test server-auth` to execute the unit tests via [Jest](https://jestjs.io).
