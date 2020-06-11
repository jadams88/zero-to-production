module.exports = {
  name: 'demo-form-builder',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/demo/form-builder',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
