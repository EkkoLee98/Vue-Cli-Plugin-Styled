

# 基於Windi CSS的VueCli工具

### 前言

  目前前端領域已有CSS樣式的技術革新--原子類（AtomicCss），接入原子類工具對項目開發或許可以起到不錯的正向意義。擁抱革新對提升程序開發的趣味性以及趕上時代發展似乎是一個不錯的選擇，但問題在於項目的穩定性也受到了不小的挑戰。

------



### 意義

  1、接入原子類工具庫有利於統一UI設計，使得我們的系統可以有屬於自己定制化的樣式庫，同時也極大利於維護。

  2、鑒於我們的項目組，精通後端的開發人員比較多，編寫繁雜的Style樣式可能會遇到困難，或者在非scope的情況下定義各種可能會重複的CSS類名等等情況。所以我們需要一個方案去解決這種問題，把開發效率提高，解放前後端開發者編寫複雜樣式時無處安放的雙手。

  3、豐富的原子類庫有利於減少單應用文件複雜樣式代碼的編寫，有利於項目的維護以及代碼的簡潔。

------

### 使用

   首先我打算把Cli工具上傳到NPM私庫，方便大家去使用，一下是接入的流程：

1. 根據官網教程(基於webpack，後續也可以支持到Vite)進行基礎的配置。

   [Windi CSS基礎配置]: https://cn.windicss.org/integrations/vue-cli.html

2. ```javascript
   npm i sfhk-styled
   npm i vue-cli-plugin-sfhk-styled --save-dev
   ```

3. ```javascript
   // 在main.js中使用插件
   import { install } from 'sfhk-styled';
   Vue.use(install);
   ```

4. 在根目錄中新建windi.config.js，並寫入有關配置，或者执行vue add @lizhengen/vue-cli-plugin-sfhk-styled自动生成，例子：

   ```javascript
   /* eslint-disable */
   
   const { defineConfig } = require('windicss/helpers');
   const createPreset = require('sfhk-styled/preset');
   const LineClampPlugin = require('windicss/plugin/line-clamp');
   
   module.exports = defineConfig({
     presets: [
       createPreset({ unit: 'rpx' }),
     ],
     plugins: [
       LineClampPlugin,
     ],
   });
   
   ```

  至此，接入成功~



  以下簡單介紹一下用法：

[Windi CSS文檔]: https://cn.windicss.org/

  優勢在於，我們可以通過一些簡單的class類去實現我們所需要的樣式，舉個簡單的例子：

  w-100：意為width：100px；

  h-100：意為height：100px；

  bg-white：意爲background：white；

  text-color-898989：意為color：#898989；

```html
<div class="w-100 h-100 bg-white text-color-898989">
    Test Windi Css
</div>
```

  這只是舉了一個簡單的例子，我們日常能用CSS以及内聯Style寫出來的樣式，都可以在原子類樣式庫裏找到一個簡寫，並可以直接運用于class上。這樣一來，相比傳統的做法”在標簽上寫style内聯樣式以及定義class類並編寫樣式代碼“，源自類具有更大的便利性。更多玩法詳見Windi CSS官網。

------

  但問題來了，接入了WindiCSS后，如果不做任何處理，意味著我們此前寫的類名以及樣式可能會有衝突的情況，這對於一個舊項目要接入Windi CSS無疑是一個壞消息。本著新舊項目無痛接入的原則，我已經找到了對策，便是利用"Babel、AST以及命名Hash化"等技術去解析並生成跟原子類有關的類名(eg: w-100 編譯後 為 w-100_[hash:5])詳見下一章@[實現](###實現)。

  於是乎便有了以下幾種更加靈活的用法：
  (Tips: sf前綴意爲順豐，插件已對帶有sf前綴的attrs進行解析)

  1、在sf:class中既可以放置原子類（w-100），也可以放置我們自定義的類名，而且標簽上的原class屬性也可以保留。

```html
<div sf:class="w-100 xxx(原類名)" class="xxx(原類名)">
    兼顧原子類以及原有類名 without v-bind
</div>
```

------

  2、sf:class亦可以利用v-bind的屬性，根據判斷條件靈活利用我們的原子類，無論是傳入對象或者數組，只要通過規範會編寫，都可以實現想要的效果。

```html
<div :sf:class="{
  'text-white': 判斷條件,
  'w-full': false,
  'customClassName': true
}">
    Test Windi CSS by binding Object
</div>


<div :sf:class="[
  'w-full font-14',
  {
    'customClassName': true,
    'leading-16': 判斷條件
  }
]">
    Test Windi CSS by binding Array
</div>
```

------

  綜上，我們已經可以在新舊項目中無痛接入原子類。

------



### 實現

  基於上述，我利用Babel、AST以及Webpack等知識體系，開發了一個用於系統接入Windi CSS原子類庫的工具。其中一個是類Vue cli的插件，另一個是支持庫。

  首先“***sfhk-styled***”作爲一個支持庫，包含了對Windi CSS的預設擴展以及對JSX寫法的支持。首先是預設擴展，Windi CSS是為我們準備了許多初始樣式以及設置的，但直接接入會導致我們的樣式會被覆蓋或者變得很亂，所以我們需要對原有的預設設定做一個覆蓋，並根據我們的項目特色做更多的擴展。再者是對JSX寫法的支持，是利用了全局變量以及Vue Mixins混合的方法去解決的。

  再者是“***vue-cli-plugin-sfhk-styled***”，是一個Vue cli工具，裏面包含的知識點有：Webpack鏈式調用、Babel轉義、AST transfer、generator以及類名hash化(避免衝突)等等知識體系。只要安裝了依賴就會自動執行標簽轉義以及loader處理等一系列工程化操作，主要實現了類名hash化以及編譯sf標簽。而且還可以利用vue invoke命令去生成使用的模板。

  由於實現過程比較複雜，想瞭解詳情或者提出優化建議可以找我交流心得。（工號：01434152）源碼我都會附上給大家看的，關於AST處理那一部分我也是藉鑒了大佬的代碼，有興趣可以互相交流一下。



下面貼一下核心代碼：

```javascript
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

```

```javascript
const path = require('path');
const { interpolateName } = require('loader-utils');
const normalizePath = require('normalize-path');
const { transform } = require('./utils/transform');
const { getLocalIdent } = require('./utils/getLocalIdent');
const WindiCSSWebpackPlugin = require('windicss-webpack-plugin');

module.exports = (api, options = {}) => {
  const { pluginOptions = {} } = options;
  const { disabled } = pluginOptions['lizhengen-styled'] || {};

  if (disabled) return;

  api.chainWebpack(config => {
    // 添加 Windi CSS 插件
    config.plugin('windicss').use(WindiCSSWebpackPlugin);

    // 设置 css 模块
    config.module
      .rule('css')
      .oneOf('normal-modules')
      .test(/(\.module\.\w+$|(virtual:)?windi\.css)/)
      .use('css-loader')
      .loader('css-loader')
      .tap(options => {
        return {
          ...options,
          modules: {
            ...options.modules,
            getLocalIdent: (loaderContext, localIdentName, localName, options) => {
              if (!options.context) {
                options.context = loaderContext.rootContext;
              }

              const request = normalizePath(
                path.relative(options.context || '', loaderContext.resourcePath)
              );

              options.content = `${options.hashPrefix + request}+${unescape(localName)}`;

              if (loaderContext.resourcePath.indexOf('virtual:windi.css') !== -1 || loaderContext.resourcePath.indexOf('windi.css') !== -1) {
                return getLocalIdent(localName, {
                  minify: process.env.NODE_ENV === 'production',
                });
              }

              return interpolateName(loaderContext, localIdentName, options)
                .replace(/^((-?[0-9])|--)/, '_$1')
                .replace(/^\.+/, '-')
                .replace(/\./g, '-')
                .replace(/\[local\]/gi, localName);
            },
          },
        };
      });

    // 添加 "sf:" 属性解析
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.compilerOptions.modules || (options.compilerOptions.modules = []);
        options.compilerOptions.modules.push({
          preTransformNode(el) {
            const sfAttrsList = el.attrsList.filter(attr => /^(v-bind:|:)?sf:/.test(attr.name.trim()));

            sfAttrsList.forEach(attr => {
              // 删除当前的属性
              delete el.attrsMap[attr.name];

              const attrName = attr.name.trim();
              const attrValue = attr.value.trim();

              const hasBindAttr = /^(v-bind:|:)/.test(attrName);

              // 重写属性的 name 和 value
              attr.name = attrName.replace(/^:?sf:/, ':');
              attr.value = transform(hasBindAttr ? attrValue : `"${attrValue}"`);

              // 覆盖原有的属性
              el.attrsMap[attr.name] = attr.value;
            });

            return el;
          },
        });

        return options;
      });
  });
};

```

```javascript
const { resolve, range, getColors, getPercentRange } = require('./utils');

/**
 * 生成 Windi CSS 预设
 * @param {Partial<{
 *   baseDesignWidth: number;
 *   baseWidth: number;
 *   unit: string;
 * }>} params
 */
function createPreset(params = {}) {
  const {
    baseDesignWidth = 1920,
    baseWidth = 1920,
    unit = 'px',
  } = params;

  /**
   * @param {number} num
   * @return {string}
   */
  const getPxValue = (num) => {
    return `${num * baseWidth / baseDesignWidth}${unit}`;
  };

  /**
   * @param {number} min
   * @param {number} max
   * @param {number=} step
   */
  const getPxRange = (min, max, step) => range({
    min,
    max,
    step,
    iterator: (num) => [num, getPxValue(num)],
  });

  return {
    unit,
    /**
     * @deprecated 接入 Windi CSS 后不再需要这个属性
     */
    purge: {
      enabled: process.env.NODE_ENV === 'production',
      content: [
        resolve('./public/**/*.html'),
        resolve('./src/**/*.{vue,ts,js,wxs}'),
      ],
      defaultExtractor(content) {
        const contentWithoutStyleBlocks = content.replace(
          /<style[^]+?<\/style>/gi,
          '',
        );
        return (
          contentWithoutStyleBlocks.match(
            /[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g
          ) || []
        );
      },
      safelist: [
        /** vue 动画样式 */
        /-(leave|enter|appear)(|-(to|from|active))$/,
        /^(?!(|.*?:)cursor-move).+-move$/,
        /^router-link(|-exact)-active$/,
        /** 自定义属性 */
        /data-v-.*/,
        /** 组件库 */
        /\.(el)-.*/,
      ],
    },
    theme: {
      /** 一般不需要用到媒体查询 */
      screens: {},
      colors: {
        // 主题色
        primary: {
          DEFAULT: 'var(--color-primary)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
        },
        // 白色
        white: '#FFFFFF',
        // 标题、重点文案
        black: '#000000',
        color: {
          ...getColors([
            // 背景色
            '#F3F3F5',
            // 内容区背景色
            '#F6F7FB',
            '#F6F6F6',
            // 骨架屏背景
            '#F1F1F1',
            '#F7F7F7',
            // 卡片背景
            '#F7F8FA',
            // 多用于表单页二级设置项底色
            '#F8F9FA',
            // 卡片骨架屏背景
            '#C1C1C1',
            // 边框颜色
            '#F0F0F0',
            // 按钮背景
            '#242424',
            // 用于重要级文字信息
            '#333333',
            // 主要文案、输入文案
            '#353535',
            // 主要文案、输入文案
            '#535353',
            // 用于白底左侧栏一级导航、暗色系的二级导航
            // 用于普通段落文字信息
            '#666666',
            // 用于白底左侧栏二级导航、暗色系的三级导航
            '#888888',
            // 次要文案
            '#898989',
            // 用于白底左侧栏导航项的归类
            '#AAAAAA',
            // 用于暗色系一级导航
            '#BBBBBB',
            // 提示文案
            '#B2B2B2',
            // 暗色系导航字体颜色
            // 用于辅助、次要的文字信息
            '#999999',
            // 标签背景色
            '#F54531',
            // 侧边栏暗色底
            '#1A1C21',
            // 滚动条
            // 分割线颜色、标签描边
            '#F2F2F2',
            // 滚动条 hover
            '#E8E7E7',
            // 输入框边框颜色
            '#D9D9D9',
            // 边框颜色
            '#ECECEC',
            '#E5E5E5',
            '#DADADA',
            // 边框颜色-2
            '#DCDFE6',
            // 置灰文字颜色
            '#BCBCBC',
            // 提示文字
            '#CCCCCC',
            // 表头背景色
            '#FAFAFA',
            // 表格 hover
            '#EFF4FF',
            // 背景色
            '#F5F5F5',
            // 按钮禁用
            '#E6E6E6',
            '#E1E1E1',
            '#D8D8D8',
          ]),
        },
        transparent: 'transparent',
      },
      spacing: getPxRange(0, 100, 0.5),
      width: {
        ...getPxRange(0, 800),
        auto: 'auto',
        ...getPercentRange([2, 3, 4, 5, 6, 12]),
        full: '100%',
        screen: '100vw',
      },
      minWidth: {
        ...getPxRange(0, 800),
        full: '100%',
        min: 'min-content',
        max: 'max-content',
        auto: 'auto',
      },
      maxWidth: {
        ...getPxRange(0, 800),
        none: 'none',
        full: '100%',
        min: 'min-content',
        max: 'max-content',
      },
      height: {
        ...getPxRange(0, 800),
        auto: 'auto',
        ...getPercentRange([2, 3, 4, 5, 6]),
        full: '100%',
        screen: '100vh',
      },
      minHeight: {
        ...getPxRange(0, 800),
        full: '100%',
        screen: '100vh',
      },
      maxHeight: {
        ...getPxRange(0, 800),
        full: '100%',
        screen: '100vh',
      },
      padding: {
        ...getPxRange(0, 200, 0.5),
        auto: 'auto',
      },
      margin: {
        ...getPxRange(-200, 200, 0.5),
        auto: 'auto',
      },
      borderWidth: {
        0: 0,
        DEFAULT: `1${unit}`,
        ...getPxRange(2, 200, 0.5),
      },
      borderRadius: {
        ...getPxRange(1, 100, 0.5),
        inherit: 'inherit',
        none: 0,
        half: '50%',
        full: '9999px',
      },
      opacity: range({
        min: 0,
        max: 100,
        iterator: (num) => [num, num / 100],
      }),
      letterSpacing: getPxRange(0, 10, 0.5),
      boxShadow: {
        DEFAULT: '0px 1px 4px rgba(0, 0, 0, 0.04)',
        md: '0px 6px 16px rgba(0, 0, 0, 0.04)',
        lg: '0px 6px 26px rgba(0, 0, 0, 0.04)',
        none: 'none',
      },
      fontFamily: {
        pc: ['Microsoft YaHei', 'PingFang SC', 'Arial'],
        wxapp: ['PingFang SC', 'Microsoft YaHei', 'Arial'],
        app: ['Source Han Sans', 'Microsoft YaHei', 'Arial'],
      },
      fontSize: {
        ...range({
          min: 1,
          max: 200,
          step: 0.5,
          iterator: (num) => [num, [getPxValue(num), {
            lineHeight: 1,
          }]],
        }),
        0: '0px',
        inherit: 'inherit',
        none: '0px',
      },
      lineHeight: {
        ...getPxRange(1, 200, 0.5),
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
      },
      zIndex: {
        // -20 ~ 50 用于基础使用
        ...range({ min: -20, max: 50 }),
        // 2000 ~ 2100 用于弹窗
        ...range({ min: 2000, max: 2100 }),
        none: 0,
        // 用于 loading 等层级超高的情况
        top: '99999',
        auto: 'auto',
      },
    },
    variants: {},
    plugins: [],
    corePlugins: {
      accessibility: false,
      preflight: false,
      space: false,
      divideColor: false,
      divideOpacity: false,
      divideStyle: false,
      divideWidth: false,
    },
  };
}

module.exports = createPreset;

```

------

### 結語

  如果條件允許，我希望可以把這兩個工具上傳到我們的私庫中， 方便大家使用和交流學習心得~也希望這兩個工具能給我們帶來更多創新的idea和效率上的提升。

# sfhk-styled vue-cli 脚手架插件

```sh
$ vue add @lizhengen/vue-cli-plugin-sfhk-styled
```
