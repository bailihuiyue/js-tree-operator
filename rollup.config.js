const typescript = require('rollup-plugin-typescript2')
const mode = process.env.MODE;
const isProd = mode === 'prod';
const pkg = require('./package.json');

module.exports = {
  input: `src/index.ts`,
  output: [
    {
      file: pkg.main,
      exports: 'named',
      format: 'cjs',
      sourcemap: !isProd
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: !isProd
    },
    {
      file: 'dist/tree-operator.js',
      name: 'treeOperator',
      format: 'iife',
      sourcemap: !isProd
    },
  ],
  plugins: [typescript({
    useTsconfigDeclarationDir: true,
    tsconfigOverride: { compilerOptions: { sourceMap: !isProd } }
  })],
};