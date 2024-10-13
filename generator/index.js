const { EOL } = require('os');
const fs = require('fs');
const { peerDependencies } = require('../package.json');

module.exports = api => {
  api.render('./template');

  api.extendPackage({
    dependencies: {
      '@lizhengen/sfhk-styled': peerDependencies['@lizhengen/sfhk-styled'],
    },
    devDependencies: {
      'windicss-webpack-plugin': '^1.6.0',
    },
  });

  api.injectImports(api.entryFile, `import { install } from '@lizhengen/sfhk-styled';`);
};

module.exports.hooks = api => {
  api.afterInvoke(() => {
    const contentMain = fs.readFileSync(api.resolve(api.entryFile), { encoding: 'utf-8' });
    const lines = contentMain.split(/\r?\n/g);

    let renderIndex = lines.findIndex(line => line.match(/Vue\.use\(/));
    if (renderIndex === -1) {
      renderIndex = lines.findIndex(line => line.match(/new[ ]+Vue\(/)) - 1;
    }
    lines[renderIndex] += `${EOL}Vue.use(install);`;

    fs.writeFileSync(api.entryFile, lines.join(EOL), { encoding: 'utf-8' });
  });
};
