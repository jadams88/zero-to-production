module.exports = {
  name: 'demo-theming',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/demo/theming',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
