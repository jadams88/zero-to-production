module.exports = {
  name: 'web-examples-feature-shell',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/web/examples/feature-shell',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
