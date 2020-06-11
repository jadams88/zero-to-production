module.exports = {
  name: 'demo-start-your-own',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/demo/start-your-own',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
