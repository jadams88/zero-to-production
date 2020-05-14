'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const child_process_1 = require('child_process');
// annotated tag
// git tag -a v1.0.0 -m "Version 1.0.0"
// non annotated tag
// git tag server-api
// last abbrev tag
// git describe --abbrev=0
// last annotated tag starting with 'v'
// git describe --abbrev=0 --match "v*"
const execP = (command) =>
  new Promise((resolve, reject) => {
    child_process_1.exec(command, (err, stdout, stderr) => {
      // 127 is the angular cli code for can't find specific project
      if (err && err.code !== 127) {
        console.error(err);
        reject(err);
      }
      resolve(stdout);
    });
  });
const stripLineEndings = (string) => string.replace(/\r?\n|\r/, '');
const AFFECTED_APPS = 'npx nx affected:apps --plain --base=origin/master';
const LATEST_VERSION = 'git describe --abbrev=0 --match "v*';
const tagApplication = (version, app) =>
  execP(`git tag -a ${app}-${version} -m "Version ${version} affected ${app}"`);
(async () => {
  const [version, apps] = await Promise.all([
    execP(LATEST_VERSION),
    execP(AFFECTED_APPS),
  ]);
  const affectedApps = stripLineEndings(apps).split(' ');
  await Promise.all(affectedApps.map((app) => tagApplication(version, app)));
})();
