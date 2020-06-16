import { demoReducer } from './demo.reducer';
import * as ExampleActions from './demo.actions';
import { IExample } from '../example.interface';

describe('ExampleReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const result = demoReducer(undefined, action);
      expect(result).toMatchSnapshot();
    });
  });

  describe('AddExamples', () => {
    it('should add the demo to the example state', () => {
      const examples: IExample[] = [
        {
          title: 'some title',
          summary: 'some description',
          description: 'some full description',
          url: 'example-1',
        },
        {
          title: 'another title',
          summary: 'some other description',
          description: 'some other full description',
          url: 'example-2',
        },
      ];

      const action = ExampleActions.addExamples({ examples });
      const result = demoReducer(undefined, action);
      expect(result).toMatchSnapshot();
    });
  });
});
