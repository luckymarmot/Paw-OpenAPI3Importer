import path from 'path'
import PACKAGE from './package.json'

const name = PACKAGE.config.extension_name
const identifier = PACKAGE.config.extension_identifier

const config = {
  mode: 'production',
  target: 'web',
  entry: './src/index.ts',
  output: {
    path: path.join(__dirname, `./dist/${identifier}`),
    filename: `${name}.js`,
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    alias: {
      types: path.resolve(__dirname, 'src/types'),
      lib: path.resolve(__dirname, 'src/lib'),
      utils: path.resolve(__dirname, 'src/utils'),
    },
    extensions: ['.ts', '.js', '.d.ts'],
  },

  devtool: 'none',
  optimization: {
    minimize: false,
  },
}

export default config
