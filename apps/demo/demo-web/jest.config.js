module.exports = {
  name: 'demo-web',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/apps/demo/demo-web',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
