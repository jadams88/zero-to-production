## TODO

- Nrwl Repo - https://github.com/nrwl/nx/issues/259 & https://github.com/nrwl/nx/issues/1515

### Docs

- [ ] Specify minium Node version (12, TS 3.8 and private fields),
- [ ] Thoroughly document the API Auth module
- [ ] Document File Replacement for router animations
- [ ] Document animations
- [ ] List other projects in readme
- [ ] Dynamic Form API
- [ ] Form Builder API

### Tests

- [ ] Refactor GraphQL Test to use Apollo Mock Client
- [ ] Document the current completed tests
- [ ] Complete Unit tests
- [ ] Complete e2e tests
- [ ] Migrate to Angular Test Harness
- [ ] tests for Lambda API
- [ ] Dynamic Form
- [ ] Form Builder

### Misc

- [ ] Audit for a11y
  - Title and Meta tags
- [ ] Migrate all code to make use ove TSv3.8
- [ ] Change Media Queries to use CSS custom properties

### DevOps

- [ ] Configure the build script to tag Docker images
- [ ] Configure the Load Balance to uses HTTP2 from Load balancer through to Reverse Proxy
  - Can the certificates be accessed from the ManagedCertificate Resource?
- [ ] Create a lambda / cron docker container to create database indexes
- [ ] Change authentication for Lambda functions to use an authorizer? This means the servers will have to be separated

## Road Map

### Angular App

- [x] Rail navigation component
- [ ] Drag & Drop Grid/Dashboard System
- [ ] Add a settings section
- [ ] Feature Flag Service
- [ ] Add following examples
  - Content Projection with layouts modules
  - Dynamic Animation Timing
  - Using Web Components

### API

- [ ] GraphQL: migrate from schema stitching to Apollo Federation?

### Mobile App

- [ ] Create a Nativescript mobile app (see issues regarding monorepo support)

### DevOps

- [x] Cloud Functions, and make library's reusable

### Schematics

- [x] Firebase Functions schematic

### @uqt/ng-node

- [] schematics for new project and library