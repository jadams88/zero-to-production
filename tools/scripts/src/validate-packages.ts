#!/usr/bin/env node
import { exec } from 'child_process';
import { resolve } from 'path';
import { promises as fsPromises } from 'fs';
const { readdir, writeFile, readFile } = fsPromises;

(async function validatePackageJson() {
  console.log('Validating package.json files');

  const workSpaceDir = process.cwd();
  const rootPackage = `${workSpaceDir}/package.json`;

  const { dependencies, devDependencies } = await readPackageJson(rootPackage);

  const packagePaths = await findNestedPackages(`${workSpaceDir}/apps`);

  const childPackages = await Promise.all(packagePaths.map(readPackageJson));
  let packagesToSave: {
    path: string;
    package: any;
  }[] = [];

  childPackages.forEach((childPackage, i) => {
    let isEdited = false;
    // Iterate over each dependency and check the main one
    // Check there are dependencies
    if (childPackage.dependencies !== undefined) {
      Object.keys(childPackage.dependencies).forEach((packageName) => {
        if (
          childPackage.dependencies[packageName] !== dependencies[packageName]
        ) {
          childPackage.dependencies[packageName] = dependencies[packageName];
          isEdited = true;
        }
      });
    }
    if (childPackage.devDependencies !== undefined) {
      Object.keys(childPackage.devDependencies).forEach((packageName) => {
        if (
          childPackage.devDependencies[packageName] !==
          devDependencies[packageName]
        ) {
          childPackage.devDependencies[packageName] =
            devDependencies[packageName];
          isEdited = true;
        }
      });
    }

    if (isEdited) {
      packagesToSave.push({
        path: packagePaths[i],
        package: childPackage,
      });
    }
  });

  await Promise.all(
    packagesToSave.map((toSave) =>
      writeFile(toSave.path, JSON.stringify(toSave.package, null, 2))
    )
  );

  await Promise.all(
    packagesToSave.map((toSave) => addPackageToGitCommit(toSave.path))
  );
  console.log('Finished validating package.json files');
})();

async function readPackageJson(path: string) {
  const jsonPackage = await readFile(path);
  return JSON.parse(jsonPackage.toString()) as {
    dependencies: { [key: string]: string };
    devDependencies: { [key: string]: string };
  };
}

function addPackageToGitCommit(path: string) {
  return new Promise((resolve, reject) => {
    exec(`git add ${path}`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve('Success');
    });
  });
}

// async function* getFiles(dir: string): any {
//   const dirents = await fsPromise.readdir(dir, { withFileTypes: true });
//   for (const dirent of dirents) {
//     const res = resolve(dir, dirent.name);
//     if (dirent.isDirectory()) {
//       yield* getFiles(res);
//     } else {
//       yield res;
//     }
//   }
// }

async function getFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files: string[][] = await Promise.all(
    dirents.map((d) => {
      const subPath = resolve(dir, d.name);
      if (d.isDirectory()) {
        return getFiles(subPath);
      } else {
        return Promise.resolve([subPath]);
      }
    })
  );

  return Array.prototype.concat(...files);
}

async function findNestedPackages(dir: string): Promise<string[]> {
  const f = await getFiles(dir);
  return f.filter((f) => {
    const p = f.split('/');
    return p[p.length - 1] === 'package.json';
  });
}
