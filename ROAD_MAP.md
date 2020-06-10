## TODO

- Nrwl Repo - https://github.com/nrwl/nx/issues/259 & https://github.com/nrwl/nx/issues/1515

### Docs

- [ ] Specify minium Node version (12, TS 3.8 and private fields),
- [x] Thoroughly document the API Auth module
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
- Common Library
  - [ ] Dynamic Form
  - [ ] Form Builder

### DevOps

- [x] Configure the build script to tag Docker images
- [ ] Configure the Load Balance to uses HTTP2 from Load balancer through to Reverse Proxy
  - Can the certificates be accessed from the ManagedCertificate Resource?
- [ ] Create a lambda / cron docker container to create database indexes
- [ ] Change authentication for Lambda functions to use an authorizer? This means the servers will have to be separated

## Road Map

### Web App

- [x] Rail navigation component
- [ ] Drag & Drop Grid/Dashboard System
- [ ] Add a settings section (theme, drag & drop dashboard builder)
- [ ] Feature Flag Service
- [ ] Add Social system
- [ ] Add following examples
  - Content Projection with layouts modules
  - Dynamic Animation Timing
  - Using Web Components
- [ ] Create own overlay component via using the HTML5.2 <dialog> element
- [ ] Migrate away from Material Components

### API

- [ ] GraphQL: migrate from schema stitching to Apollo Federation?

### Mobile App

- [ ] Create a Nativescript mobile app (see issues regarding monorepo support)

### @uqt/ng-node

- [] schematics for new project and library
