import { IExample } from '@ztp/demo/data-access';

export const examples: IExample[] = [
  {
    url: 'dynamic-form',
    title: 'Dynamic Form Component',
    summary:
      'Create a dynamic form component to remove the pain from using angular form.',
    description:
      'With the amount of boiler plate required to use forms in Angular they ' +
      'can become tedious quickly. Creating a dynamic form component ' +
      'application wide can significantly simplify forms and help standardize styling, ' +
      'validation, animations etc.',
    libPath: 'libs/common/dynamic-form',
  },
  {
    url: 'form-builder',
    title: 'Drag & Drop Form Builder',
    summary: 'A Drag & Drop form builder for user creatable forms.',
    description:
      'Building on the Dynamic Form Component, an example of a Drag & Drop Form ' +
      'Builder to allow users to build their own forms.',
    libPath: 'libs/common/form-builder',
  },
  {
    url: 'theming',
    title: 'Themeing with CSS Variables',
    summary: 'Using CSS Variables to create a user configurable theme.',
    description:
      'Combing CSS Variables along with a Theming Service for user ' +
      'configurable themes.',
    libPath: 'libs/common/utils/theme',
  },
  {
    url: 'lazy-scrolling',
    title: 'Lazy Load Scrolling',
    summary: 'A scrolling strategy to manually lazy load feature modules.',
    description:
      'It is common practice to lazy load modules as child routes but there are more ' +
      'ways to benefit from code splitting. Scrolling is just one example of how to ' +
      'manually load modules and components.',
    libPath: 'libs/common/dynamic-module-loading',
  },
  {
    url: 'todos',
    title: 'Todo App (with Auth)',
    summary: 'A demo of the versatility of a well structured Monorepo.',
    description:
      'We have all seen a Todo App before but this demonstrates how a well structured monorepo ' +
      'can make your code highly reusable.',
  },
  {
    url: 'make-it-your-own',
    title: 'Start Your Own Monorepo',
    summary:
      'Clone, build, deploy! Make this repo the start of your own project.',
    description:
      'Follow the guides to make this repo the beginning of your own project.',
  },
];
