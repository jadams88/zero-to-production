module.exports = {
  name: 'demo-secure-todos',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/demo/secure-todos',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
