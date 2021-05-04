import path from 'path'
import PKG from './package.json'

const { name, identifier } = PKG.config

const webpackConfig = {
  target: 'webworker',
  devtool: 'none',
  entry: './src/index.ts',
  stats: {
    outputPath: true,
    maxModules: 1,
  },
  output: {
    path: path.join(__dirname, `dist/${identifier}`),
    filename: `${name}.js`,
  },
  optimization: {
    minimize: false,
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
    extensions: ['.ts', '.js', '.json', '.d.ts'],
    alias: {
      types: path.resolve(__dirname, 'src/types'),
      lib: path.resolve(__dirname, 'src/lib'),
      utils: path.resolve(__dirname, 'src/utils'),
    },
  },
}

export default webpackConfig
