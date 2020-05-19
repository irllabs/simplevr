const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const environment = {
	local: '"LOCAL"',
	dev: '"DEV"',
	prod: '"PROD"'
};
const isProduction = process.argv.indexOf('-p') > -1;
const isLocal = process.argv.indexOf('-d') > -1;
const buildVariable = isLocal ? environment.local : isProduction ? environment.prod: environment.dev;

const webpackConfig = {
	context: path.resolve(__dirname, 'src'),
	entry: {
		main: './index.tsx'
	},
	output: {
		filename: '[name].bundle.js',
		sourceMapFilename: '[name].map',
		chunkFilename: '[id].chunk.js',
		path: path.resolve(__dirname, './dist'),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'index.html',
			filename: 'index.html',
		})
	],
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		modules: [path.resolve(__dirname, 'node_modules')],
		alias: {
			'ui': path.resolve(__dirname, 'src/ui/'),
			'core': path.resolve(__dirname, 'src/core/'),
			'data': path.resolve(__dirname, 'src/data/'),
			'assets': path.resolve(__dirname, 'src/assets/'),
			'root': path.resolve(__dirname, 'src'),
			'components': path.resolve(__dirname, 'src/components'),
			'irl-ui': path.resolve(__dirname, 'src/irl-ui'),
			'util': path.resolve(__dirname, 'src/util'),
			'styles': path.resolve(__dirname, 'src/styles'),
			'services': path.resolve(__dirname, 'src/services'),
			'icons': path.resolve(__dirname, 'src/icons'),
		}
	},
	devtool: 'source-map',
	externals: {
		build: buildVariable
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader'
					},
				]
			},
			{
				enforce: "pre",
				test: /\.js$/,
				loader: "source-map-loader"
			},
			{
				test: /\.svg/,
				use: [
					{
						loader: 'url-loader'
					},
					{
						loader: 'svg-url-loader'
					},
					{
						loader: 'file-loader'
					}
				],
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'sass-loader'
					}
				]
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader',
				],
			},
		]
	},

	devServer: {
		https: false,
		historyApiFallback: true,
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000
		},
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
		},
		port: 5000,
		host: 'localhost',
		disableHostCheck: true
	},
};

module.exports = webpackConfig;
