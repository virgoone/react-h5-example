import path from 'path';

import { defineConfig } from '@farmfe/core';

import { createPlugins } from './build/plugins';
import pkg from './package.json';

const ENV = process.env.REACT_APP_ENV || 'dev';
const options: Record<
  string,
  { assetsRoot: string; assetsPublicPath: string }
> = {
  pro: {
    assetsRoot: path.resolve(__dirname, './dist/PRO', pkg.version),
    assetsPublicPath: `./${pkg.name}/PRO/${pkg.version}/`,
  },
  pre: {
    assetsRoot: path.resolve(__dirname, './dist/PRE', pkg.version),
    assetsPublicPath: `./${pkg.name}/PRE/${pkg.version}/`,
  },
  uat: {
    assetsRoot: path.resolve(__dirname, './dist/UAT', pkg.version),
    assetsPublicPath: `./${pkg.name}/UAT/${pkg.version}/`,
  },
  fat: {
    assetsRoot: path.resolve(__dirname, './dist/FAT', pkg.version),
    assetsPublicPath: `./${pkg.name}/FAT/${pkg.version}/`,
  },
  dev: {
    assetsRoot: path.resolve(__dirname, './dist/DEV', pkg.version),
    assetsPublicPath: '/',
  },
};
const pathConfig = options[ENV] || options.dev;

export default defineConfig({
  plugins: createPlugins(),

  compilation: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env': process.env,
    },
    output: {
      path: pathConfig.assetsRoot,
      filename: 'assets/[name].[hash].[ext]',
      assetsFilename: 'static/[resourceName].[ext]',
    },
  },
});
