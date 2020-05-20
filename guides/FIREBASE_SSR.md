### Angular Universal with Firebase Functions

Ensure you have completed all the [prerequisites].

#### Firebase Tools

As it stands, Firebase tools is not really built to work nicely with Monorepos. By default if you run `firebase init` and select cloud functions (TS or JS) it will create a `functions/` directory at the root of your project. It will also create a `package.json` inside the `functions/` directory that lists build scripts, dependencies and the entry point to your function via the `main` field. It will also prompt you to install required dependencies **inside** the `functions/` directory which you do **not** want.

It is important to understand that the reason the `package.json` is added inside the `functions/` directory is that when you deploy your functions with `firebase deploy`, firebase tools will deploy the entire contents of the `functions/` directory. Firebase will then install all dependencies and run any commands listed under the `predeploy` field of the `functions` field in `firebase.json`. If scripts are listed in the `predeploy` field they must be listed in the `package.json` that is deployed to Firebase.

Currently `firebase-tools` only supports a single `firebase.json` file (and subsequently only one Functions directory). The limitation of the single `firebase.json` can be worked around with the help of **Angular CLI Builders** as seen below. See [#590] & [#1115] for further details.

#### Add Angular Universal

It is advised to read through the [Angular Universal] guide to help understand the complexity that Angular Universal is handling for you. When you add Angular Universal to the `todos` app some of the limitations of using SSR will become apparent and you might decide that your project does not warrant server side rendering.

##### 1. Add & Configure Angular Universal for the Todo Application

Add angular universal to the Todos Application with the express engine schematics.

```bash
$ ng add @nguniversal/express-engine --clientProject todos-web
```

A number of files are created and edited as per the docs at [Angular Universal], however note the following:

- `app.module.ts`: The imported `BrowserModule` in `AppModule` now calls `withServerTransition({appId: 'serverApp'})`. Change `serverApp` to something like `todoApp`.
- `server.ts`: there will be some errors because of the TypeScript configuration and a type definition mismatch. Change the following two statements.

  ```typescript
  // change
  import * as express from 'express';
  // to
  import express from 'express';

  // At the time of writing, the express engine had a type definition
  // mismatch and 'strict' mode was showing as an error.
  // This may have been fixed and may not be needed.
  // If so, ignore the next part and let me know.

  // change
  server.engin(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );

  // to
  server.engin(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    }) as any // stop typescript error
  );
  ```

In the `server.ts` file take note of the defined distribution folder

```typescript
const distFolder = join(process.cwd(), 'dist/todos-web/browser');
```

Note that it is pointing to the output directory of the browser build and that it is assumes the current working directory is the root directory of the repo. While this is fine initially it will be altered later when configuring for Firebase functions.

##### 2. Test SSR is working

Test that SSR is working correctly by opening an incognito browser window and **disable JavaScript** (ctrl + shift + p in the developers console) so that you can see the server rendered output only. Then run to server.

```bash
$ npm run dev:srr
```

Once compiled, visit `http://localhost:4200` to access your application. The normal `login` page should be shown. If you try to login, nothing will happen. Because JavaScript can not bootstrap and run some features will not work such as `reactive forms`. Open another incognito window and reload the app. All functionality should work as normal once the client application bootstraps.

While the Todo application might have limited benefits for SSR, your application might i.e only part of the application might require authentication.

A word of warning - If you access browser API's (such as `localStorage`) these will throw errors in the server rendered application depending on when you access them. Ensure to check what platform the application is currently running on when the API is accessed.

```typescript
// some.component.ts
constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

someMethod() {
  if (isPlatformBrowser(this.platformId)) {
    // safe to access browser API's
    const foo: any = localStorage.getItem('foo');
  }
}
```

#### Initialize & Configure Firebase Functions

Because of the limitations of the Firebase Cli as discussed above, there is some setup required to make it work nicely with the Monorepo structure. Rather than create and setup the files manually, a workspace schematic is provided in `tools/schematics/` to scaffold a new _functions_ project and modify our Todos application. To run the schematic run the following:

```bash
$ npx nx workspace-schematic universal-firebase --clientProject=todos-web --firebaseProject=<your-firebase-project-name>
```

The Firebase project option is the project name as listed on the Firebase console.

A new project has been created in `apps/todos/todos-web-functions`. It is now safe to delete the `firebase.json` in the root directory.

#### What has the schematic done?

The schematic has taken care of scaffolding and configuring the Universal Application and has added a new `todos-web-functions` project. The project is configured to build into a `dist/` directory **inside** the source directory, i.e. `apps/todos/todos-web-functions/dist/`. This means the **current working directory** of the server process (`server.ts`) will be different when hosted on Firebase functions and the `distFolder` inside `server.ts` has been altered to reflect the new current working directory.

```typescript
// apps/todos/todos-web/server.ts
// this
const distFolder = join(process.cwd(), 'dist/todos-web/browser');

// has now become this
const distFolder = join(process.cwd(), 'dist/browser');
```

The available Angular CLI targets are:

- **`build`** (& **`build:production`**): builds project as well as both the client app and server side bundle into the functions `dist/` directory.
- **`serve`**: builds and serves the project with
  ```bash
  firebase server --project <your-firebase-project>
  ```
- **`deploy`**: executes `build:production` then deploys the project to firebase.

Refer to the `angular.json` file for a complete list of targets.

Additionally a **`functions`** build target has been added to the `todos-web` project as below.

```json
// todos-web > architect > build > configurations

"functions": {
  "outputPath": "apps/todos/todos-web-functions/dist/browser",
  "index": "apps/todos/todos-web/src/index.original.html",
  "baseHref": "/<your-firebase-project>/us-central1/universal/"
}
```

- **outputPath**: Builds the client bundle into the `todos-web-functions` directory for testing / deployment

* **index**: Use the `index.original.html` generated by the schematic in place of `index.html`.

  The rewrite rules in the newly generated `firebase.json` would suggest that if a resource was requested with a `*.html` extension then it would be served via the cloud function

  ```json
  // apps/todos/todos-web-functions/firebase.json

  "rewrites": [
    {
      "source": "**/*.@(js|css|svg)",
      "destination": "/index.html"
    },
    {
      "source": "**",
      "function": "universal"
    }
  ]
  ```

  However That is not the case. Irrespective of the rewrite rules Firebase will **always** serve an `index.html` file if it is present in the hosting directory. The Universal Server is configured to serve an `index.original.html` instead of an `index.html` if it is found in the client directory and hence replacing the `index.html` with `index.original.html` will ensure the the cloud function servers your application.

  ```ts
  // server.ts
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? 'index.original.html'
    : 'index';
  ```

- **baseHref**: running `firebase serve` will serve the function at `http://localhost:5001/<your-firebase-project>/us-central1/universal/`. If the `baseHref` is set to `/` (default), all static assets will fail to load. When building for production this is overridden by the production target.

  Note: For the `baseHref` property to be applied at build time, resource must be loaded relatively.

  ```html
  <!-- will NOT work -->
  <img src="assets/images/github-white.svg" alt="(opens GitHub repo)" />

  <!-- will work -->
  <img src="./assets/images/github-white.svg" alt="(opens GitHub repo)" />
  ```

#### Try it out

Serve the Firebase function locally

```bash
$ ng serve todos-web-functions
```

When ready for deployment, make a production build:

```bash
$ ng run todos-web-functions:build:production
```

deploy your application:

```bash
$ ng run todos-web-functions:deploy
```

The URL's that your application is hosted at will be output to the terminal.

#### Setup a Custom Domain

If you have not set up a custom domain your functions will most probably not serve properly due to the `baseHref` as described earlier. Follow the Firebase docs to configure your [custom domain].

#### Add a Service Worker (Optional)

While not directly associated with server side rendering, a Service Worker plays nicely with a server rendered application. The SSR application is rendered first and the client application bootstraps once all resources are loaded. Once the client application bootstraps it will activate the service worker and cache all client resources. On next visit the service worker will serve the cached client files before any request are made and the application will load instantly. See here for more details on the [Angular Service Worker].

```bash
$ ng add @angular/pwa --project todos-web
```

There are two thing that need to be configured to make the service worker work with the Universal Application.

- The **pwa** schematic will alter the `index.html` file but not the `index.original.html`. Add the additional tags manually, they will look something like the below:

  ```html
  <link rel="manifest" href="manifest.webmanifest" />
  <meta name="theme-color" content="#1976d2" />
  ```

- Change the default configuration of the `ngsw-config.json` to account for the SSR application serving `index.original.html` so that the file hashes will match and work offline as expected.

  ```json
  {
    ...
    "index": "/index.original.html", <- change to this
    "assetGroups": [
      {
        ...
        "files": [
          "/favicon.ico",
          "/index.html",
          "/index.original.html", <- add this
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
  ```

The service worker will only run in production mode so rebuild the client application in production mode including the firebase configuration.

```bash
$ ng run todos-web:build:production,functions
```

serve locally to test:

```bash
$ ng run todos-web:run
```

Visit the locally hosted URL to test your app. The server side app should load as normal and the client app will bootstrap once all resources are loaded. Refresh the browser and the app should load almost instantly as the service worker served the locally cached files. Turn the network off and see what happens:

`Dev Tools` &rarr; `Network` &rarr; `Online/Offline`

Refresh the browser with the network turned off and you should still get the same result and the application will now work offline.

##### Considerations

Not every applications will benefit from all aspects of server side rendering, specifically the time to first paint. Depending on the traffic load, if the function is not "hot" the cold start associated with cloud function first loads may cause your app to load significantly slower than a non SSR rendered application.

[prerequisites]: https://zero-to-production.dev/guides/getting-started
[#590]: https://github.com/firebase/firebase-tools/issues/590
[#1115]: https://github.com/firebase/firebase-tools/issues/1115
[angular universal]: https://angular.io/guide/universal
[demo site]: https://zero-to-production.dev
[custom domain]: https://firebase.google.com/docs/hosting/custom-domain
[angular service worker]: https://angular.io/guide/service-worker-intro
[firebase functions]: https://firebase.google.com/products/functions
