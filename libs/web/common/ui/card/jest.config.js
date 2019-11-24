module.exports = {
  name: 'libs-common-ui-card',
  preset: '../../../../../jest.config.js',
  coverageDirectory: '../../../../../coverage/libs/libs/common/ui/card',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
