'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var ExternalModuleFactoryPlugin = _interopDefault(require('webpack/lib/ExternalModuleFactoryPlugin'));

class PeerDepsExternalsPlugin {
  constructor (config = {}) {
    const { externalGen } = config;
    this.externalGen = externalGen;
  }

  getPeerDependencies () {
    try {
      const { resolve } = require('path');
      const pkg = require(resolve(process.cwd(), 'package.json'));
      return Object.keys(pkg.peerDependencies)
        .map(name => {
          if (this.externalGen && typeof this.externalGen === 'function') {
            return this.externalGen(name)
          }
          return new RegExp('^' + name + '(/)?', 'i')
        })
    } catch (err) {
      return []
    }
  }

  apply (compiler) {
    const peerDependencies = this.getPeerDependencies();

    if (compiler.hooks) {
      compiler.hooks.compile.tap('compile', params => {
        new ExternalModuleFactoryPlugin(
          compiler.options.output.libraryTarget,
          peerDependencies
        ).apply(params.normalModuleFactory);
      });
    } else {
      throw new Error('PeerDepsExternalsPlugin must rely on webpack 4+')
    }
  }
}

module.exports = PeerDepsExternalsPlugin;
