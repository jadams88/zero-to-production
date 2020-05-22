### Getting Started

If you want to use this monorepo as the starting point for your next project or to work through the guides then follow the below instructions to tidy up and remove all unused apps & libs.

#### Clone & install all dependencies

```bash
$ git clone https://github.com/jonathonadams/zero-to-production.git workspace

$ cd workspace

$ npm i
```

##### Housekeeping

- change `package.json` fields as required, e.g. `name`, `license`, `version`, `repository`.
- change the application prefix by doing a `search and replace` for **ztp** and replace with your desired app prefix.
- edit/delete `CODE_OF_CONDUCT.md` and `LICENSE.md` files as desired.
- create you own color theme in `styles/theme.scss`

##### Remove "Examples" Project Files (Optional)

The "Examples" angular app and respective libs are all the files
associated with this demo site at [zero-to-production.dev]

- delete the "examples" applications in `apps/examples/*`
- delete all libs corresponding to the "Examples" application at `libs/examples/*`
- delete all projects and libraries in the `angular.json` and `nx.json` that begin with `examples-`. These should be all projects starting from `examples-web`.
- delete all TypeScript path `@aliases` starting with `@ztp/examples/*` in `tsconfig.json`
- remove the `scope:examples` entry from the `nx-enforce-module-boundaries` rule in `tslint.json`

  ```json
  // tslint.json
  "nx-enforce-module-boundaries": [
  ...
  // delete these lines
    {
      "sourceTag": "scope:examples",
      "onlyDependOnLibsWithTags": ["scope:examples", "scope:shared"]
    }
  ```

- uninstall unused / unwanted npm packages.

  ```bash
  npm uninstall <package>
  ```

  - `prismjs`
  - `marked`
  - `firebase-admin`
  - `firebase-functions`
  - `@angular/service-worker`
  - `@angular/platform-server`
  - `@nguniversal/express-engine`
  - `express`
  - `@types/express`

##### Project Structure

The repo follows the [Nrwl] monorepo guidelines where all applications are in the `apps/` directory and all associated libraries are in the `libs/` directory. Assuming you have followed the above and deleted the `examples` applications you should be left with the following app structure:

- `apps/todos/todos-web` - The Angular web Todo application.
- `apps/todos/todos-web-e2e` - The Angular web end-to-end application.
- `apps/server/api` - The API built to run in Docker & Kubernetes
- `apps/server/lambda` - The API built to run serverless on AWS Lambda.

See the [NX] site for further details on project structure.

##### Configure the Application (Important)

Some parts of the project have been configured specifically for the [zero-to-production.dev], such as configuring the API `User` model to not require unique emails. These places have been commented with the required steps to correct.

In your IDE, search for `ZTP_AFTER_CLONE` and make the appropriate changes as per the comments.

#### Local Development

Local development is relatively simple.

To serve the Angular Todo web application run `ng serve` (or `ng serve todos-web`)

To run the API run either `ng serve server-api` or `ng serve server-lambda`. `ng serve server-api` will run the docker based API and `ng serve server-lambda` will run the AWS Lambda functions API. Both servers are served on port 3000.

Note that before you can run the the API the following must be configured

- Create a local MongoDB server. The [docker cheat-sheet] describes how to do so with docker.
- create a `.env` file for environment variables in the project root of both `apps/server/api` & `apps/server/lambda`. An example `.env` file is located in `apps/server`, copy and rename `.env.example` into each project root directory and rename to `.env`, and set the desired environment variables.

  **WARNING** - Do NOT use the `RSA256` private / public keys that are in `.env.example`. They are example keys are public and are not secure, they are just demonstrating how to set them in the `.env` file.

#### Project Configuration

- TypeScript `strict` mode - This project has be configured to use `strict` mode (along with Angular full template checking). This is not for everyone. This can be configured in `tsconfig.base.json`. The `strictPropertyInitialization` option has been set to `false` as compilation errors will be thrown for property inputs in Angular components.

- [TypeScript project references] - The repo makes use of TypeScript project references for all server and shared libs as the Docker API does not use `webpack` to bundle the server side code. For an example of configuring a project and library using project references, see `apps/server/api/tsconfig.json` for referencing an external library and `libs/server/auth/tsconfig.json` & `libs/server/auth/tsconfig.lib.json` for configuring the build file via the `buildInfoFile` property.

- Nested `package.json` files - Although this is a Monorepo with a root level `package.json` for managing dependencies, an additional `package.json` file is located within the API server directory. The `server.Dockerfile` build process will use the nested `package.json` to install all its development & production dependencies that are specific to the the server project only. If you install or remove any dependencies (via `npm install/uninstall <package>`) for the API they will have to be added manually to nested `package.json` file. Once the dependencies have been added, on each git commit the version numbering will be synced to the root `package.json` file automatically.

#### Continuos Integration & Semantic Release

In shot, Circle CI is set up to run two workflows. The first, `build-and-test`, will run on any PR into master and lint, test & build all affected apps/libs by the changes.

The second, `release-and-deploy`, runs on any commit to master (i,e, any PR being merged) and will lint, test, & build the effected projects, generate a new semver release based on the commit messages and publish to GitHub. If any of the projects are affected by the changes they will be deployed to the respective service (Firebase Functions, AWS Lambda). Any release will also trigger a Kubernetes rolling update of the API server. See the [kubernetes guide] for further info.

Edit the CI config file located at`.circleci/config.yml` to suite your own needs.

#### Guides & Deployment

The following guides are a series of instructions to take your newly cloned project from local development to a deployed working frontend & API.

It is advised to follow the guides in the following order as they are designed to get you up and running and deployed and then progressively increase in complexity as your application grows and warrants it.

##### Prerequisites

To complete the guides you will need to complete the following

- **Create Cloud Providers Accounts** - If you do not have accounts already you will need to create accounts with **[Firebase]**, **[AWS]** & **[Google Cloud]**.

- **Install CLI's & global npm packages**

  - Install the [Google Cloud SDK] and [Kubernetes CLI] and authenticate to your Google Cloud Account (**Kubernetes guide only**).
  - Install the [AWS CLI] and login and create a profile for your AWS account (**AWS Lambda guide only**).
  - Install the following global npm packages
    ```bash
    npm install -g @angular/cli firebase-tools serverless
    ```

- **Domain Name**: To work through the guides you will need a domain name. The following guides will assume a domain name of `zero-to-production.dev`. For the API deployment the guides will assume AWS Lambda functions will be hosted at the subdomain `fns.zero-to-production.dev` and the Google Cloud K8s will be hosted at the subdomain `api.zero-to-production.dev`

* **RS256 Private & Public Key**: A Private & Public key is required for signing your JWT access tokens. Depending on the authentication setup (see the [API Authentication Library]) the public key may be served as a [JSON Web Key Set (JWKS)] at the url `/.well-know/jwks.json`. See [Auth 0] for further explanation and rational behind a JWKS.  
  There is a helper script in `tools/scripts/bin/generate-rsa.js` to generate an RSA256 Private Key (pkcs8).

* **Mongo Database**: You will need a Mongo Database for your API to connect to. It is entirely up to you how & where you host your DB but [Mongo Atlas] has a free tier that you can use to test with. A couple of notes on setting up Mongo Atlas.

  - For this testing setup, allow connections from all IP Addresses. See the notes later about setting up **VPC Network Peering** in production.
  - Once your cluster is up an running, click **collections** and create a database (note the name) and the first collection i.e. the `users` collection.
  - Click **connect > connect your application** and get your connection string. By default the connection string will point to the `test` database. Replace the test database with the desired database, i.e. `mongodb+srv://.../my-database-name?retryWrites=true&w=majority`

#### Next Steps

Deploy your serverless API with [AWS Lambda]

[zero-to-production.dev]: https://zero-to-production.dev
[docker cheat-sheet]: https://github.com/jonathonadams/zero-to-production/docker/DOCKER_CHEAT_SHEET.md
[typescript project references]: https://www.typescriptlang.org/docs/handbook/project-references.html
[google cloud sdk]: https://cloud.google.com/sdk
[kubernetes cli]: https://kubernetes.io/docs/reference/kubectl
[aws cli]: https://docs.aws.amazon.com/cli/latest/userguide/indstall-cliv2.html
[mongo atlas]: https://www.mongodb.com/cloud/atlas
[api authentication library]: https://github.com/jonathonadams/zero-to-production/libs/server/auth/README.md
[json web key set (jwks)]: https://tools.ietf.org/html/rfc7517
[auth 0]: https://auth0.com/docs/tokens/concepts/jwks
[nrwl]: https://nrwl.io
[nx]: https://nx.dev
[firebase]: https://firebase.google.com
[google cloud]: https://cloud.google.com
[aws]: https://aws.amazon.com/
[aws lambda]: https://zero-to-production.dev/guides/guides/aws-lambda
[kubernetes guide]: https://zero-to-production.dev/guides/google-cloud-k8s

<!-- - Deploy your serverless API with [AWS Lambda]
- Deploy you Angular app with [Firebase Hosting]
- Add server side rendering to your Angular app with [Angular Universal & Firebase Functions]
- Migrate your API from serverless functions to a Kubernetes Cluster with [Google Cloud Kubernetes] -->

<!-- [firebase hosting]: https://zero-to-production.dev/guides/guides/firebase-hosting -->
<!--
[angular universal & firebase functions]: https://zero-to-production.dev/guides/ssr-firebase-functions -->
<!-- [google cloud kubernetes]: https://zero-to-production.dev/guides/google-cloud-k8s -->
