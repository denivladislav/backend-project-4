import pageLoad from '../src';

test('initial test', () => {
  expect(pageLoad({ url: '', dirpath: '' })).toEqual('working');
});
