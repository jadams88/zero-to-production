import { join, relative, normalize } from 'path';
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { names } from '@nrwl/workspace';

interface FireBaseFunctionsSchema {
  clientProject: string;
  firebaseProject: string;
}

export default function (schema: FireBaseFunctionsSchema): Rule {
  return chain([
    addProjectFiles(schema.clientProject),
    updateServerDistributionPath(schema.clientProject),
    createOriginalIndexAndChangePath(schema.clientProject),
    addProjectToAngularJson(schema.clientProject, schema.firebaseProject),
    addProjectToNxJson(schema.clientProject),
    updateOutputPathsAndBaserHref(schema.clientProject),
    addTestFirebaseConfiguration(schema.clientProject, schema.firebaseProject),
    addFirebaseTarget(schema.clientProject),
  ]);
}

function addProjectFiles(name: string): Rule {
  return (host: Tree) => {
    const angularJson = JSON.parse(
      (host.read('angular.json') as Buffer).toString()
    );
    const projectRoot: string = angularJson.projects[name].root;
    const projectDirectory = join(projectRoot, '../', `${name}-functions`);
    const relativePath = relative(projectDirectory, process.cwd()).replace(
      /\\/g,
      '/'
    );

    return mergeWith(
      apply(url('./files'), [
        template({
          tmpl: '',
          ...names(`${name}-functions`),
          relativePath,
          projectDirectory,
        }),
        move(normalize(projectDirectory)),
      ])
    );
  };
}

function updateServerDistributionPath(name: string): Rule {
  return (host: Tree) => {
    const angularJson = JSON.parse(
      (host.read('angular.json') as Buffer).toString()
    );
    const projectRoot: string = angularJson.projects[name].root;
    const serverPath = join(projectRoot, 'server.ts');
    let server: Buffer | null | string = host.read(serverPath);
    if (!server) throw new Error('Universal server not found');
    server = server.toString();
    const newServer = server.replace(`dist/${name}/browser`, 'dist/browser');
    host.overwrite(serverPath, newServer);
  };
}

function createOriginalIndexAndChangePath(name: string): Rule {
  return (host: Tree) => {
    const angularJson = JSON.parse(
      (host.read('angular.json') as Buffer).toString()
    );
    const projectSource: string = angularJson.projects[name].sourceRoot;

    // Read the original index and create a 'index.original.html' files
    const indexHtmlPath = join(projectSource, 'index.html');
    const index = (host.read(indexHtmlPath) as Buffer).toString();
    host.create(join(projectSource, 'index.original.html'), index);

    const buildTargetFixed = angularJson.projects[name].architect.build;

    buildTargetFixed.configurations.production.index = join(
      projectSource,
      'index.original.html'
    );
    angularJson.projects[name].architect.build = buildTargetFixed;
    host.overwrite('angular.json', JSON.stringify(angularJson, null, 2));
  };
}

function addTestFirebaseConfiguration(
  name: string,
  firebaseProject: string
): Rule {
  return (host: Tree) => {
    const angularJson = JSON.parse(
      (host.read('angular.json') as Buffer).toString()
    );

    const projectRoot: string = angularJson.projects[name].root;
    const projectDirectory = join(projectRoot, '../', `${name}-functions`);

    const config = {
      outputPath: `${projectDirectory}/dist/browser`,
      index: `${projectRoot}/src/index.original.html`,
      baseHref: `/${firebaseProject}/us-central1/universal/`,
    };

    angularJson.projects[name].architect.build.configurations[
      'functions'
    ] = config;
    host.overwrite('angular.json', JSON.stringify(angularJson, null, 2));
  };
}

function updateOutputPathsAndBaserHref(name: string): Rule {
  return (host: Tree) => {
    const angularJson = JSON.parse(
      (host.read('angular.json') as Buffer).toString()
    );
    const projectRoot: string = angularJson.projects[name].root;
    const functionsDirectory = join(projectRoot, '../', `${name}-functions`);
    const buildTargetFixed = angularJson.projects[name].architect.build;
    const serveTargetFixed = angularJson.projects[name].architect.serve;
    const serverTargetFixed = angularJson.projects[name].architect.server;
    buildTargetFixed.options.baseHref = '/';
    buildTargetFixed.configurations.production.baseHref = '/';
    serveTargetFixed.options.baseHref = '/';
    serverTargetFixed.options.outputPath = `${functionsDirectory}/dist/server`;
    angularJson.projects[name].architect.build = buildTargetFixed;
    angularJson.projects[name].architect.serve = serveTargetFixed;
    angularJson.projects[name].architect.server = serverTargetFixed;
    host.overwrite('angular.json', JSON.stringify(angularJson, null, 2));
  };
}

// FUTURE_UPDATE
// https://github.com/firebase/firebase-tools/issues/590
// function addProjectToFirebaseJson() {

// }

function addProjectToNxJson(name: string): Rule {
  return (host: Tree) => {
    const nxJson = JSON.parse((host.read('nx.json') as Buffer).toString());

    const [scope] = name.split('');
    const projectName = `${name}-functions`;

    const project = {
      tags: [`scope:${scope}`, 'type:app', 'platform:web'],
      implicitDependencies: [name],
    };

    nxJson.projects[projectName] = project;
    host.overwrite('nx.json', JSON.stringify(nxJson, null, 2));
  };
}

function addProjectToAngularJson(name: string, firebaseProject: string): Rule {
  return (host: Tree) => {
    const angularJson = JSON.parse(
      (host.read('angular.json') as Buffer).toString()
    );

    const projectName = `${name}-functions`;
    const projectRoot: string = angularJson.projects[name].root;
    const functionsDirectory = join(projectRoot, '../', projectName);

    const project = {
      root: `${functionsDirectory}`,
      sourceRoot: `${functionsDirectory}/src`,
      projectType: `application`,
      architect: {
        build: {
          builder: '@uqt/ng-node:build',
          options: {
            outputPath: `${functionsDirectory}/dist`,
            src: `${functionsDirectory}/src`,
            tsConfig: `${functionsDirectory}/tsconfig.json`,
          },
        },
        'build-all': {
          builder: '@angular-devkit/architect:concat',
          options: {
            targets: [
              {
                target: `${name}:build:functions`,
              },
              {
                target: `${name}:server`,
              },
              {
                target: `${projectName}:build`,
              },
            ],
          },
          configurations: {
            production: {
              targets: [
                {
                  target: `${name}:build:functions, production`,
                },
                {
                  target: `${name}:server:production`,
                },
                {
                  target: `${projectName}:build`,
                },
              ],
            },
          },
        },
        serve: {
          builder: '@angular-devkit/architect:concat',
          options: {
            targets: [
              { target: `${projectName}:build-all` },
              { target: `${projectName}:run` },
            ],
          },
        },
        run: {
          builder: '@nrwl/workspace:run-commands',
          options: {
            commands: [
              {
                command: `firebase serve --project ${firebaseProject}`,
              },
            ],
            cwd: functionsDirectory,
          },
        },
        'firebase-deploy': {
          builder: '@nrwl/workspace:run-commands',
          options: {
            commands: [
              { command: `firebase deploy --project ${firebaseProject}` },
            ],
            cwd: functionsDirectory,
          },
        },
        deploy: {
          builder: '@angular-devkit/architect:concat',
          options: {
            targets: [
              { target: `${projectName}:build-all:production` },
              { target: `${projectName}:firebase-deploy` },
            ],
          },
        },
        lint: {
          builder: '@angular-devkit/build-angular:tslint',
          options: {
            tsConfig: [`${functionsDirectory}/tsconfig.spec.json`],
            exclude: ['**/node_modules/**', `!${functionsDirectory}**`],
          },
        },
        test: {
          builder: '@nrwl/jest:jest',
          options: {
            jestConfig: `${functionsDirectory}/jest.config.js`,
            tsConfig: `${functionsDirectory}/tsconfig.spec.json`,
          },
        },
      },
    };

    angularJson.projects[projectName] = project;
    host.overwrite('angular.json', JSON.stringify(angularJson, null, 2));
  };
}

function addFirebaseTarget(name: string): Rule {
  return (host: Tree) => {
    const buildAll = {
      builder: '@angular-devkit/architect:concat',
      options: {
        targets: [
          { target: `${name}:build:functions` },
          { target: `${name}:server` },
          { target: `${name}-functions:build` },
        ],
      },
      configurations: {
        production: {
          targets: [
            { target: `${name}:build:production,production` },
            { target: `${name}:server:production` },
            { target: `${name}-functions:build` },
          ],
        },
      },
    };

    const angularJson = JSON.parse(
      (host.read('angular.json') as Buffer).toString()
    );
    angularJson.projects[`${name}-functions`].architect['build-all'] = buildAll;
    host.overwrite('angular.json', JSON.stringify(angularJson, null, 2));
  };
}
