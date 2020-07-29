import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { join } from 'path';
// import helmet from 'helmet';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  // const distFolder = join(process.cwd(), 'dist/apps/demo/demo-web');
  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? 'index.original.html'
    : 'index';

  // server.use((req, res, next) => {
  //   return helmet({
  //     expectCt: { enforce: true },
  //     hsts: {
  //       maxAge: 63072000, // two years
  //       includeSubDomains: true,
  //       preload: true,
  //     },
  //     contentSecurityPolicy: {
  //       directives: {
  //         'default-src': ["'self'"],
  //         'connect-src': [
  //           'https://zero-to-production.dev',
  //           'https://*.zero-to-production.dev',
  //         ],
  //         'worker-src': [`'self'`],
  //         'script-src': [`'self'`, 'cdnjs.cloudflare.com'],
  //         'img-src': [`'self'`, 'ssl.gstatic.com'],
  //         'style-src': [
  //           `'unsafe-inline'`, // TODO -> Remove this, limitation of angular at the moment
  //           `'self'`,
  //           'fonts.googleapis.com',
  //           'cdnjs.cloudflare.com',
  //         ],
  //         'style-src-elem': [
  //           `'unsafe-inline'`, // TODO -> Remove this, limitation of angular at the moment
  //           `'self'`,
  //           'fonts.googleapis.com',
  //           'cdnjs.cloudflare.com',
  //         ],
  //         'font-src': ['fonts.gstatic.com'],
  //         'upgrade-insecure-requests': [],
  //       },
  //     },
  //   })(req, res, next);
  // });

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    }) as any
  );

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(distFolder, {
      maxAge: '1y',
    })
  );

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    });
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
