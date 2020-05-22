### Deploy your Web App with Firebase Hosting

Ensure you have completed all the [prerequisites].

#### Configure the Application

The only configuration that is required is set the API URL to point to your deployed API.

Change `serverUrl` in `apps/todos/todos-web/src/environments/environments.prod.ts` to point to your API server. If you are following along with the guides this will be the URL configured on AWS Lambda

#### Analyze your build (optional)

Prior to deploying your application it is recommended to analyze the production bundle.

1. Make a production build of your application with a `stats.json`

   ```bash
   $ ng build <target> --prod --stats-json
   ```

2. Analyze the bundle with `webpack-bundle-analyzer`

   ```bash
   $ npm run bundle:analyze -- path/to/distribution/directory/stats.json
   ```

#### Deploy on Firebase Hosting

1.  Make a production build of your application

    ```bash
    $ ng build <target> --prod
    ```

2.  **Optional**: test the production build with [Nginx & Docker]
3.  Authenticate with Firebase

    ```bash
    $ firebase login
    ```

4.  Initiate a new firebase project

    ```bash
    $ firebase init
    ```

5.  Choose **Hosting**
6.  Choose **Use an existing project** and select your desired project
7.  Chose the desired output directory e.g. `dist/apps/todos/todos-web`
8.  Select **yes** to configure as a single-page app
9.  Select **no** to override your existing `index.html`
10. Deploy your project

    ```bash
    $ firebase deploy
    ```

The URL's that your application is hosted at will be output to the terminal.

#### Setup Custom Domain

Follow the firebase docs to configure your [custom domain] for your application.

#### Add Server Side Rendering & Service Worker

When your application warrants it add server side rendering by follow the [SSR and deploy on Firebase Functions] guide.

[prerequisites]: https://zero-to-production.dev/guides/getting-started
[nginx & docker]: https://github.com/jonathonadams/zero-to-production/docker/README.md
[custom domain]: https://firebase.google.com/docs/hosting/custom-domain
[ssr and deploy on firebase functions]: https://zero-to-production.dev/guides/ssr-firebase-functions
