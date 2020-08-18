import path from 'path'
import PACKAGE from './package.json'


const name = PACKAGE.config.extension_name
const identifier = PACKAGE.config.extension_identifier

const config = {
  mode: 'production',
  target: 'node-webkit',
  entry: './src/index.ts',
  output:{
    path: path.join(__dirname, `./dist/${identifier}`),
    filename: `${name}.js`
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ]
  },

  resolve: {
    extensions: [ '.ts', '.js', '.d.ts' ],
  },

  devtool: 'inline-source-map',

  optimization: {
    minimize: false
  },
}

export default config
