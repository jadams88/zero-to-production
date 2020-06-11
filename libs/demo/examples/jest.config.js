module.exports = {
  name: 'demo-examples',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/demo/examples',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
