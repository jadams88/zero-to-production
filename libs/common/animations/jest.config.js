module.exports = {
  name: 'common-animations',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/common/animations',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
