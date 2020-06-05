# Backend Authentication Library

This library contains all modules and service to authenticate users and secure your REST or GraphQL API.

## Configuration Options

TODO -> Document environment variables for Auth module
TODO -> Sendgrid API Key, including template -> move out of auth module?
TODO -> With JWKS or without (for guards). With Refresh Token route or not

## Generate RS256 Private / Pub Key pair

- Short Lived Access Token -> If using JWKS, public key is 'auto' rotated and does not need to be deployed

## Running unit tests

Run `ng test server-auth` to execute the unit tests via [Jest](https://jestjs.io).
