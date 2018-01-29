let path = require('path')
let HTMLWebpackPlugin = require('html-webpack-plugin')
let CopyWebpackPlugin = require('copy-webpack-plugin')

let cwd = __dirname || process.cwd()

let DEV = path.join(cwd, '../src/')
let DEBUG = path.join(cwd, '../build/')

let config = {
  devtool: 'source-map',
  entry: {
    main: DEV + 'js/index.js'
  },
  output: {
    path: DEBUG,
    filename: '[name].min.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: DEV + 'js',
        loader: 'babel-loader',
        query:
        {
          presets: ['react']
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.(jpg|jpeg|png|gif|ico)$/,
        loader: 'url-loader?limit=100000?name=[name].[ext]&publicPath=../assets/&outputPath=assets/'
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: DEV + 'index.html',
      filename: 'index.html',
      inject: 'body'
    }),
    new CopyWebpackPlugin([
      {
        from: DEV + 'assets',
        to: 'assets'
      },
      {
        from: DEV + 'manifest.json',
        to: 'manifest.json'
      },
      {
        from: DEV + 'service-worker.js',
        to: 'service-worker.js'
      }
    ])
  ]
}

// Export.
module.exports = config
