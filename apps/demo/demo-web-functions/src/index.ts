import { https } from 'firebase-functions';

// Note: the import of the 'app' is in relation to this file once built.
// The server application will be in 'dist/server/main.js', hence we load the app from 'server/main'
// as this file will be at the root, i.e. 'dist/index.js'
// @ts-ignore
import { app } from './server/main';

export const universal = https.onRequest(app());
