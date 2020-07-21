require('dotenv').config({ path: `${process.cwd()}/apps/server/lambda/.env` });

module.exports = {
  name: 'server-lambda',
  setupFilesAfterEnv: ['jest-extended'],
  testEnvironment: 'node',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/apps/server/lambda',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
};
