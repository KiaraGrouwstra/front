// https://github.com/webpack/webpack#loaders
// http://webpack.github.io/docs/list-of-loaders.html
// https://github.com/angular-class/angular2-webpack-starter/blob/master/webpack.config.js
var path = require('path');
var webpack = require('webpack');
var babelSettings = {
	cacheDirectory: true,
	'presets': [
		// 'es2015-native-modules',
		'es2015-webpack', // leaves ES6 modules intact; still required, for `let { foo: bar, ...baz } = obj`.
		// 'es2015', // used for 'import', sweetjs calls this too; tried alt. `{ foo } = require('pkg')` but fails with lazy imports
		'stage-0', // 0 for await, 1 for [assigned methods](https://github.com/jeffmo/es-class-fields-and-static-properties)
		// 'lodash',
	],
	'plugins': [
		'syntax-async-functions', // async/await
		'transform-regenerator',
		'transform-runtime',
		'add-module-exports',
		'transform-decorators-legacy', // @
		'angular2-annotations',	// @Component, etc.
		'transform-class-properties',
		'transform-flow-strip-types',
	],
};

function q(loader, query) {
  return loader + '?' + JSON.stringify(query);
}

var sweet = q('sweetjs', {
	modules: [
		path.join(__dirname, './macros.js')
	],
});
var babel = q('babel', babelSettings);
var ts = q('ts', {});

module.exports = {
	context: path.join(__dirname, 'app'),
	entry: {
		boot: './boot',
	},
	output: {
		// This is where images AND js will go
		path: path.join(__dirname, 'dist'),
		// This is used to generate URLs to e.g. images
    // publicPath: 'http://mycdn.com/',
		// chunkFilename: '[name].[id].js',
		filename: '[name].js'
	},
	// https://webpack.github.io/docs/configuration.html#devtool
  devtool: 'eval', //'source-map',
	module: {
		loaders: [
			{
				test: /\.ts$/,
				loaders: [
					// sweet,
					babel,
					ts,
				],
			},
			{
				test: /\.js$/,
				//exclude: [ path.resolve(__dirname, 'node_modules'), ],
				include: [
					path.resolve(__dirname, 'app'),
				],
				loaders: [
					// sweet,
					babel,
					// ts,		// no point, TSC won't even load JS files?
				],
			},
			{ test: /\.json$/, loader: 'json' },
			{ test: /\.html$/, loader: 'html' },
			{ test: /\.jade$/, loader: 'html!jade-html' },
			// style!css!cssnext!autoprefixer! over raw! for non-ng2 inclusion
			// { test: /\.less$/, loader: 'raw!less' },	//raw is for ng2 `styles: [require('./style.less')]`
			// ^ ng2 sucks for css though -- `css` loader pre-resolves urls, `style` injects into DOM.
			{ test: /\.less$/, loader: 'style!css!less' },
			{ test: /\.css$/, loader: 'style!css' },
			// { test: /\.(jpe?g|png)$/, loader: 'url?limit=8192' }, // inline base64 URLs for <=8k images, direct URLs for the rest
			{ test: /\.(jpe?g|png|gif|ttf|eot|svg|woff(2)?|wav|mp3)$/, loader: 'file' }
		],
		// postLoaders: [
    //   // instrument only testing sources with Istanbul
    //   {
    //     test: /\.[tj]s$/,
    //     include: path.join(__dirname, 'app'),
    //     loader: 'babel-istanbul-loader',	//istanbul-instrumenter-loader
    //     exclude: [
    //       /\.(e2e|spec)\.[tj]s$/,
    //       /node_modules/
    //     ]
    //   },
    // ],
	},
	resolve: {
		extensions: [
			// you can now require('file') instead of require('file.coffee')
			'', '.js', '.ts', '.json', '.jade', '.css', '.less', '.sass', '.scss', '.html'
		],
		// root: ['node_modules', 'app'].map((folder) => path.join(__dirname, folder))
		modulesDirectories: ['node_modules', 'app'],
		root: __dirname
	},
  plugins: [
		// new JasmineWebpackPlugin(),
		// Materialize
		new webpack.ProvidePlugin({
	    $: 'jquery',
	    jQuery: 'jquery',
	    'Hammer': 'hammerjs/hammer'
		}),
		//new webpack.optimize.UglifyJsPlugin(),
  ],
	stats: {
	  colors: false,
	  modules: true,
	  reasons: true
  },
	node: {
		fs: 'empty',
		tls: 'empty',
		net: 'empty',
		dns: 'empty',
		setImmediate: true
	},
	// noParse: [/\/dist\//],
	progress: true,
  keepalive: true,
  ts: {
		transpileOnly: true,
 		ignoreDiagnostics: [
			1009, // `Trailing comma not allowed` -- I prefer using those so adding/removing params just affects 1 line.
			2300,	// `Duplicate identifier` -- if a Component has `get` + `set` for an `@Input`, this throws three times. ugh.
		],
 	}
}
