import * as React from 'react';
import renderer from 'react-test-renderer';

import { ThemedText } from '../themed/ThemedText';

it(`renders correctly`, () => {
  let tree;
  let testRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });

  tree = testRenderer.toJSON();
  expect(tree).toMatchSnapshot();
});
