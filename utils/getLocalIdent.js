const { interpolateName } = require('loader-utils');

/**
 * key 原子类转换后的名称
 * value 原子名称
 * @type {Record<string, string>}
 */
const hashMap = {};
/**
 * key 为遇到冲突后已修复的原子类名
 * value 为修复后的名称
 * @type {Record<string, string>}
 */
const hashFixedMap = {};

/**
 * @param {string} localName
 * @param {{ minify?: boolean; }} options
 */
function getLocalIdent(localName, options) {
  // 如果原子类已遇到过冲突，并且修复了名称，直接返回
  if (hashFixedMap[localName]) return hashFixedMap[localName];

  if (typeof options === 'undefined') options = {};

  localName = unescape(localName);

  let localIdentName = '[local]_[contenthash:5]';

  if (options.minify) {
    localIdentName = '[contenthash:5]';
  } else {
    localName = localName.replace(/(\\.| )/g, '_');
  }

  const content = `lizhengen-sfhk-styled+${localName}`;

  let hashDigest = interpolateName({}, localIdentName, { content })
    .replace(/^((-?[0-9])|--)/, '_$1')
    .replace(/^\.+/, '-')
    .replace(/\./g, '-')
    .replace(/\[local\]/gi, localName);

  // 如果计算后的 hash 值有冲突，则在 hash 值后追加 '_'
  // 对于 第 n 次 冲突的 原子类，会追加 (n - 1) 个 '_'
  if (hashMap[hashDigest] && hashMap[hashDigest] !== localName) {
    while (hashMap[hashDigest]) {
      hashDigest += '_';
    }

    hashFixedMap[localName] = hashDigest;
  }
  hashMap[hashDigest] = localName;

  return hashDigest;
}

exports.getLocalIdent = getLocalIdent;
