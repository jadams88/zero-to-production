module.exports = {
  name: 'web-shared-auth-routes',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/web/shared/auth-routes',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
