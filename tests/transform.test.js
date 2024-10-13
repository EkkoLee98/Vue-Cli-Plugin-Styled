const { transform } = require('../utils/transform');
const { getLocalIdent } = require('../utils/getLocalIdent');
const cssesc = require('cssesc');

/**
 * @param {string} className
 * @return {string}
 */
function parser(className) {
  const from = cssesc(className, { isIdentifier: true });

  return getLocalIdent(from, {
    minify: process.env.NODE_ENV === 'production',
  });
}

test('表达式', () => {
  expect(transform(
    'express'
  )).toBe(
    'express'
  );

  expect(transform(
    'arr[index]'
  )).toBe(
    'arr[index]'
  );

  expect(transform(
    "express + ' a b-[c] block'"
  )).toBe(
    `express + ' a b-[c] ${parser('block')}'`
  );

  expect(transform(
    "arr[index] > -1 ? 'a flex' : 'b justify-center'"
  )).toBe(
    `arr[index] > -1 ? 'a ${parser('flex')}' : 'b ${parser('justify-center')}'`
  );

  expect(transform(
    "arr[index] > -1 ? express : 'b c flex'"
  )).toBe(
    `arr[index] > -1 ? express : 'b c ${parser('flex')}'`
  );

  expect(transform(
    "(arr[index] > -1 ? express : 'b c justify-center') + demo"
  )).toBe(
    `(arr[index] > -1 ? express : 'b c ${parser('justify-center')}') + demo`
  );

  expect(transform(
    "a ? b : ''"
  )).toBe(
    "a ? b : ''"
  );

  expect(transform(
    "'a flex' + (a ? b : '') + ''"
  )).toBe(
    `'a ${parser('flex')}' + (a ? b : '') + ''`
  );
});

test('字符串', () => {
  expect(transform(
    "''"
  )).toBe(
    "''"
  );

  expect(transform(
    "'demo flex'"
  )).toBe(
    `'demo ${parser('flex')}'`
  );

  expect(transform(
    "'demo b text-[32px]'"
  )).toBe(
    `'demo b ${parser('text-[32px]')}'`
  );
});

// TODO: 添加模板字符串解析
// test('模板字符串', () => {
//   example1: `a-${demo}b c`;

//   example2: `a- ${demo} b c`;

//   example3: `a ${demo ? `a${qq}` : 'b'}`;
// });

test('对象', () => {
  expect(transform(
    "{}"
  )).toBe(
    "''"
  );

  expect(transform(
    `{
      [classes[1]]: false,
    }`
  )).toBe(
    "false ? classes[1] : ''"
  );

  expect(transform(
    `{
      flex: true,
      'a': true,
      'b flex': false,
      'text-[32px]': arr[index] > -1,
    }`
  )).toBe(
    `(true ? '${parser('flex')}' : '') + ' ' + (true ? 'a' : '') + ' ' + (false ? 'b ${parser('flex')}' : '') + ' ' + (arr[index] > -1 ? '${parser('text-[32px]')}' : '')`
  );

  expect(transform(
    `{
      [classes[1] + 'a b flex']: false,
    }`
  )).toBe(
    `false ? classes[1] + 'a b ${parser('flex')}' : ''`
  );

  expect(transform(
    `arr[index] > -1 ? {
      'a': true,
      'b text-center': false,
      'text-[32px]': arr[index] > -1,
    } : false`
  )).toBe(
    `arr[index] > -1 ? (true ? 'a' : '') + ' ' + (false ? 'b ${parser('text-center')}' : '') + ' ' + (arr[index] > -1 ? '${parser('text-[32px]')}' : '') : false`
  );
});

test('数组', () => {
  expect(transform(
    "[]"
  )).toBe(
    "''"
  );

  expect(transform(
    `[{
      'text-color-33': true,
      'text-center': false,
    }, btn, 'asdmd34', timeLine[index] === -1 ? '12345 55 text-right' : '67890 text-left' ]`
  )).toBe(
    `(true ? 'text-color-33' : '') + ' ' + (false ? '${parser('text-center')}' : '') + ' ' + btn + ' ' + 'asdmd34' + ' ' + (timeLine[index] === -1 ? '12345 55 ${parser('text-right')}' : '67890 ${parser('text-left')}')`
  )
});
