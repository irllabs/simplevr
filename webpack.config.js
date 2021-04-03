const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  stats: 'errors-warnings',
  mode: 'development',
  watch: true,
  devServer: {
    contentBase: 'public',
    port: 5000,
    historyApiFallback: true,
    hotOnly: true,
  },
  module: {
    rules: [
      {
        test: /\.(t|j)s(x?)$/u,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/build'),
    publicPath: '/build/'
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: './src/index.html',
        path: path.resolve(__dirname, "public"),
        filename: '../index.html',
        inject: 'head'
    }),
    new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'aframe',
            entry: 'https://aframe.io/releases/1.0.4/aframe.min.js',
            global: 'AFRAME',
          },
          {
            module: 'socket.io',
            entry: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js',
            global: 'io',
          },
          {
            module: 'open-easyrtc',
            entry: 'api/easyrtc.js',
            global: 'easyrtc',
          },
          {
            module: 'networked-aframe',
            entry: 'https://unpkg.com/networked-aframe@0.8.2/dist/networked-aframe.js',
            global: 'NAF',
          },
        ],
    }),
    new ProgressBarPlugin(),
    new NodePolyfillPlugin(),
    new ForkTsCheckerWebpackPlugin()
  ]
};
