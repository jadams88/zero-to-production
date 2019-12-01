# PRE ALPHA - WORK IN PROGRESS

## Checklist

### Web App

#### App

- [x] Finish user registration. NOTE -> For the demo, don't require unique emails
- [ ] Examples sections
  - Form Builder
- [ ] Add a settings section
  - Re style user drop down to only have username, avatar and link to settings
- [ ] Move Todo detail to own component

#### Dynamic Form

- [x] Dynamic Form to accept validators
- [x] Dynamic Form global errors (with animations)
- [x] Make the form errors pipe accept form level errors.
- [ ] Collect form errors from side effects submit
- [x] Restyle errors animations
- [x] Submit button not using content projection does not have auto focus
- [ ] Make dynamic form use recursive field types (array/group)
- [ ] Write tests for dynamic form

#### Form Builder

- [ ] Document
- [ ] Add field types, select fields etc
- [ ] Tests

#### Accessability

- [ ] Audit for a11y

#### Tests

- [ ] Complete Unit tests
- [ ] Complete e2e tests

## Road Map

### App

- [ ] Add preloader spinner
- [ ] Feature Flag Service
- [ ] Add an example sections outline functionality
  - Content Projection with layouts modules
  - Users to create components and dynamically add routing to them
  - Dynamic Animation Timing
  - Using Web Components
  - Charting and report generating (jsPdf)

### Deployment

- [ ] Create a demo site & cloud functions

### Dev Ops

- [ ] Docker build script for dynamic projects (using Docker ENV inputs)
- [ ] Kubernetes Specs
- [ ] Cloud Functions

### Mobile App

- [ ] Add Nativescript support

## Issues to track / tidy up before release.

- Mongo DB - Sanitization [Warning](https://github.com/mongodb-js/mongodb-core/issues/453)

### Jest & ES6 Modules

Currently Jest does not support es6 Modules, so modules can not be used in testing
lodash-es is tree shakeable, however fails tests at the moment so install individual common lodash libraries for now then remove them when
the below issue is resolved.
https://github.com/facebook/jest/issues/4842

### RXJS & TypeScript Filter Issues

TS does not correctly infer the types when using filters, current typescript issues

https://github.com/Microsoft/TypeScript/issues/10734
https://github.com/Microsoft/TypeScript/issues/16069

### Angular IVY and Strict Mode

Generic template checking.
https://github.com/angular/angular/issues/30235

### TS Path References are not inherited

Once merged, remove references from the tsconfig.lib.json's

https://github.com/Microsoft/TypeScript/issues/27098

### RouterLink directive is broken for relative paths with empty strings

https://github.com/angular/angular/issues/13011

### Nativescript does not currently support the monorepo design

https://github.com/NativeScript/NativeScript/issues/7537

## TestCafe E2E Builder

TODO -> Create a TestCafe Builder

## uqt
