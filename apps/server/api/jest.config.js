require('dotenv').config({ path: `${process.cwd()}/apps/server/api/.env` });

module.exports = {
  name: 'server-api',
  setupFilesAfterEnv: ['jest-extended'],
  runner: './single-thread.js',
  testEnvironment: 'node',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/apps/server/api',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
};
