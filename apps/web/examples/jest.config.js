module.exports = {
  name: 'web-examples',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/apps/web/examples',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
