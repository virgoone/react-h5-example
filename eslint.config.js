import antfu from '@antfu/eslint-config';

export default antfu({
  // enable UnoCSS support
  // https://unocss.dev/integrations/vscode
  unocss: false,

  ignores: ['.github'],
  formatters: {
    css: true,
  },
});
