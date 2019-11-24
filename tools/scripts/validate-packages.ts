// @ts-ignore
import readJson from 'read-package-json';
import glob from 'glob';
import { promisify } from 'util';
const asyncGlob = promisify(glob);
const asyncReadJson = promisify(readJson);

(async function validatePackageJson() {
  console.log('Validating package.json files.');

  const workSpaceDir = process.cwd();
  const collectedErrors: string[] = [];
  const rootPackage = `${workSpaceDir}/package.json`;

  const { dependencies, devDependencies } = readPackageJson(rootPackage);

  const packagePaths = await asyncGlob(`${workSpaceDir}/apps/**/package.json`);

  const childPackages = await Promise.all(packagePaths.map(readPackageJson));

  childPackages.forEach(packageJson => {
    // Iterate over each dependency and check the main one
    // Check there are dependencies
    if (packageJson.dependencies !== undefined) {
      Object.keys(packageJson.dependencies).forEach(packageName => {
        if (
          packageJson.dependencies[packageName] !== dependencies[packageName]
        ) {
          // The packages do not match up
          collectedErrors.push(
            createErrorMessage(
              packageJson.name,
              packageName,
              packageJson.dependencies[packageName],
              dependencies[packageName]
            )
          );
        }
      });
    }
    if (packageJson.devDependencies !== undefined) {
      Object.keys(packageJson.devDependencies).forEach(packageName => {
        if (
          packageJson.devDependencies[packageName] !==
          devDependencies[packageName]
        ) {
          // The packages do not match up
          collectedErrors.push(
            createErrorMessage(
              packageJson.name,
              packageName,
              packageJson.dependencies[packageName],
              dependencies[packageName]
            )
          );
        }
      });
    }
  });

  if (collectedErrors.length > 0) {
    collectedErrors.forEach(error => {
      console.error(error);
    });
    process.exit(1);
  } else {
    console.log('All files seem to be in order.');
  }
})();

function readPackageJson(path: string) {
  return asyncReadJson(path, false);
}

// function isPropertyDefined(property: any): boolean {
//   return !!property;
// }

function createErrorMessage(
  projectName: string,
  packageName: string,
  currentVersionNumber: string,
  requiredVersionNumber: string
): string {
  return `${projectName} has mismatching version for ${packageName}. Receive ${currentVersionNumber} but should be ${requiredVersionNumber}`;
}
