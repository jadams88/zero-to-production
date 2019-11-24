import { examplesReducer } from './examples.reducer';
import * as ExampleActions from './examples.actions';
import { IExample } from '@ngw/types';

describe('ExampleReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const result = examplesReducer(undefined, action);
      expect(result).toMatchSnapshot();
    });
  });

  describe('AddExamples', () => {
    it('should add the examples to the example state', () => {
      const examples: IExample[] = [
        {
          id: '1',
          title: 'some title',
          description: 'some description',
          url: 'example-1',
          gitHubLink: ''
        },
        {
          id: '2',
          title: 'another title',
          description: 'another description',
          url: 'example-2',
          gitHubLink: ''
        }
      ];

      const action = ExampleActions.addExamples({ examples });
      const result = examplesReducer(undefined, action);
      expect(result).toMatchSnapshot();
    });
  });
});
