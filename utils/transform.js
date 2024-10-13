const path = require('path');
const t = require('@babel/types');
const { parseExpression } = require('@babel/parser');
const { default: generator } = require('@babel/generator');
const { getLocalIdent } = require('./getLocalIdent');
const cssesc = require('cssesc');
const Processor = require('windicss');

const processor = new Processor(getWindiConfig());

/**
 * transform 转义类名时的白名单，白名单内的不需要验证直接转义
 */
const whiteList = [
  'group',
];

/**
 * @param {string} attrValue
 * @return {string}
 */
function transform(attrValue = '') {
  try {
    const expression = parseExpression(attrValue);

    switch (expression.type) {
      case 'StringLiteral':
      case 'BinaryExpression':
      case 'ConditionalExpression':
      case 'ArrayExpression':
      case 'ObjectExpression':
        return generatorCode(parser(expression));
      default:
        return attrValue;
    }
  } catch (err) {
    return attrValue;
  }
}

exports.transform = transform;

/**
 *
 * @param {t.Node} ast
 * @return {string}
 */
function generatorCode(ast) {
  return generator(
    ast,
    {
      jsescOption: { quotes: 'single' },
    },
  ).code;
}

/**
 * @param {t.Expression[]} expressions
 * @return {t.Expression}
 */
function getBinaryExpression(expressions = []) {
  if (expressions.length === 0) return t.stringLiteral('');
  if (expressions.length === 1) return expressions[0];

  const lastExpression = expressions.pop();

  return t.binaryExpression(
    '+',
    t.binaryExpression(
      '+',
      expressions.length === 1 ? expressions[0] : getBinaryExpression(expressions),
      t.stringLiteral(' '),
    ),
    lastExpression,
  );
}

/**
 * @param {t.Node} node
 */
function parser(node) {
  switch (node.type) {
    case 'StringLiteral':
      return parserStringLiteral(node);
    case 'ConditionalExpression':
      return parserConditionalExpression(node);
    case 'BinaryExpression':
      return parserBinaryExpression(node);
    case 'ObjectExpression':
      return parserObjectExpression(node);
    case 'ArrayExpression':
      return parserArrayExpression(node);
    default:
      return node;
  }
}

function isAtomicClass(value) {
  if (whiteList.indexOf(value) !== -1) return true;

  return processor.validate(value).success.length > 0;
}

/**
 * @param {t.StringLiteral} node
 * @return {t.Identifier}
 */
function parserStringLiteral(node) {
  const value = node.value
    .split(' ')
    .map(value => {
      if (!isAtomicClass(value)) return value;

      const from = cssesc(value, {
        isIdentifier: true,
      });

      return getLocalIdent(from.replace(/,/g, '2c '), {
        minify: process.env.NODE_ENV === 'production',
      });
    })
    .join(' ');

  if (!value) return t.stringLiteral('');

  return t.stringLiteral(value);
}

/**
 * @param {t.ConditionalExpression} node
 * @return {t.ConditionalExpression}
 */
function parserConditionalExpression(node) {
  return t.conditionalExpression(
    node.test,
    parser(node.consequent),
    parser(node.alternate),
  );
}

/**
 * @param {t.BinaryExpression} node
 * @return {t.BinaryExpression}
 */
function parserBinaryExpression(node) {
  return t.binaryExpression(
    node.operator,
    parser(node.left),
    parser(node.right),
  );
}

/**
 * @param {t.ObjectExpression} node
 * @return {t.TemplateLiteral}
 */
function parserObjectExpression(node) {
  const props = node.properties.map(prop => {
    return t.conditionalExpression(
      prop.value,
      parser(propKeyToStringLiteral(prop)),
      t.stringLiteral(''),
    );
  });

  return getBinaryExpression(props);
}

/**
 * @param {t.ObjectMethod | t.ObjectProperty | t.SpreadElement} prop
 */
function propKeyToStringLiteral(prop) {
  if (prop.computed) return prop.key;

  switch (prop.type) {
    case 'ObjectMethod':
    case 'ObjectProperty':
      switch (prop.key.type) {
        case 'Identifier':
          return t.stringLiteral(prop.key.name);
        case 'NumericLiteral':
          return t.stringLiteral(`${prop.key.value}`);
      }
  }

  return prop.key;
}

/**
 * @param {t.ArrayExpression} node
 * @return {t.TemplateLiteral}
 */
function parserArrayExpression(node) {
  const elements = node.elements.map(element => parser(element));

  return getBinaryExpression(elements);
}

function getWindiConfig() {
  try {
    return require(path.join(process.cwd(), 'windi.config.js'));
  } catch (error) {
    // logError('获取 windicss 配置出错，可能会影响原子类名生成');
    return {};
  }
}
