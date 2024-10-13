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
