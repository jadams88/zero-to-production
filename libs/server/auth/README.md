# Backend Authentication Library

This library contains all modules and service to authenticate users and secure your REST or GraphQL API.

## ZTP_AFTER_CLONE - Delete these after cloning the repo

1. Delete the demo folder first. These are simplified auth controllers for the purpose of the demo website, e.g. no email verification.
2. Remove the references from the demo directory in the [index.ts](./src/index.ts) file.
3. On the `User` model in the `core-date` library, change the unique value of the `email` property

TODO

## Configuration Options

TODO -> Document environment variables for Auth module
TODO -> Sendgrid API Key, including template -> move out of auth module?
TODO -> With JWKS or without (for guards). With Refresh Token route or not

## Generate RS256 Private / Pub Key pair

- Short Lived Access Token -> If using JWKS, public key is 'auto' rotated and does not need to be deployed

## Running unit tests

Run `ng test server-auth` to execute the unit tests via [Jest](https://jestjs.io).
