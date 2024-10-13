const { getLocalIdent } = require('../utils/getLocalIdent');

test('hash 散列值冲突情况', () => {
  expect(getLocalIdent('text-44', { minify: true })).toBe('c1834');
  expect(getLocalIdent('max-w-500', { minify: true })).toBe('c1834_');
  expect(getLocalIdent('max-w-500', { minify: true })).toBe('c1834_');
});
