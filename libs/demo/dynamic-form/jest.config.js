module.exports = {
  name: 'demo-dynamic-form',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/demo/dynamic-form',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
