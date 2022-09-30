const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'eval',
  resolve: {
    extensions: ['.js', '.jsx']
  },
  entry: {
    bundle: ['./src/index']
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: '/node_modules',
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react'
          ]
        }
      }
    ]
  },
  devServer: {
    open: true,
    port: 9000
  }
}