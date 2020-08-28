import 'zone.js/dist/zone-node';
import { existsSync } from 'fs';
import { join } from 'path';
import { ngKoaEngine } from '@ztp/common/universal-engine';
import Koa from 'koa';
// @ts-ignore
import serve from 'koa-static';
// @ts-ignore
import helmet from 'koa-helmet';

import { AppServerModule } from './src/main.server';

// The Koa app is exported so that it can be used by serverless Functions.
export function app() {
  const server = new Koa();
  const distFolder = join(process.cwd(), 'dist/apps/demo/demo-web');
  // const distFolder = join(process.cwd(), 'dist/browser');
  const indexFilename = existsSync(join(distFolder, 'index.original.html'))
    ? 'index.original.html'
    : 'index.html';
  const indexPath = join(distFolder, indexFilename);

  // TODO -> Remove the 'unsafe-inline', limitation of angular at the moment
  server.use(
    helmet({
      expectCt: { enforce: true },
      hsts: {
        maxAge: 63072000, // two years
        includeSubDomains: true,
        preload: true,
      },
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'connect-src': [
            'https://zero-to-production.dev',
            'https://*.zero-to-production.dev',
          ],
          'worker-src': [`'self'`],
          'script-src': [`'self'`, 'cdnjs.cloudflare.com'],
          'img-src': [`'self'`, 'ssl.gstatic.com'],
          'style-src': [
            `'unsafe-inline'`,
            `'self'`,
            'fonts.googleapis.com',
            'cdnjs.cloudflare.com',
          ],
          // 'style-src-elem': [
          //   `'unsafe-inline'`,
          //   `'self'`,
          //   'fonts.googleapis.com',
          //   'cdnjs.cloudflare.com',
          // ],
          'font-src': ['fonts.gstatic.com'],
        },
      },
    })
  );

  // Universal Koa engine
  const render = ngKoaEngine({
    bootstrap: AppServerModule,
  });

  // Serve static files from /browser
  server.use(
    serve(distFolder, {
      // Do not serve the index file because it needs to be rendered by the Universal engine
      index: false,
      maxAge: 86400 * 365 * 1000,
    })
  );

  // All regular routes use the Universal engine
  server.use(async (ctx) => {
    await render(indexPath, ctx);
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Koa server listening on http://localhost:${port}`);
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
