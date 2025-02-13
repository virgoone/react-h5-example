import less from '@farmfe/js-plugin-less';
import postcss from '@farmfe/js-plugin-postcss';

export function createPlugins() {
  const plugins = [
    '@farmfe/plugin-react',
    less(),
    postcss(),

    // https://github.com/vadxq/vite-plugin-vconsole
  ];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return plugins;
}
