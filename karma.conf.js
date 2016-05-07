var webpack_conf = require('./webpack.config');
webpack_conf.entry = {};

module.exports = function(config) {
  config.set({
    basePath: 'app',  // path to resolve files, exclude
    // frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],  //, 'requirejs', 'es6-shim', 'chai'
    files: [
      { pattern: '../karma-test-shim.js', watched: true, included: true, served: true },
    ],
    exclude: [
    ],
    // preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '../karma-test-shim.js': [
        'coverage',
        'webpack',
        'sourcemap',
      ],
    },

    coverageReporter: {
      dir : '../coverage/',
      reporters: [
        { type: 'text' },
        { type: 'json' },
        { type: 'html' }
      ]
    },

    webpack: webpack_conf,
    webpackMiddleware: {
      noInfo: true
    },
    // reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [ 'progress' ],  //'coverage', , 'dots'  //dots leads to double printing
    // proxied base paths: required for component assests fetched by Angular's compiler
    proxies: {
      '/app/': '/base/app/'
    },
    port: 8769,
    colors: true,
    logLevel: config.LOG_INFO,    // LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    autoWatch: true,
    // browsers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeCanary'], //, 'Chrome', 'ChromeCanary', 'PhantomJS', 'PhantomJS_custom'

    // customLaunchers: {
    //   'PhantomJS_custom': {
    //     base: 'PhantomJS',
    //     options: {
    //       windowName: 'my-window',
    //       settings: {
    //         webSecurityEnabled: false
    //       },
    //     },
    //     flags: ['--load-images=true'],
    //     debug: true
    //   }
    // },
    // phantomjsLauncher: {
    //   exitOnResourceError: true
    // },

    // Continuous Integration mode: if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    concurrency: Infinity, // simultanous browsers

    plugins: [
      'karma-coverage',
      'karma-jasmine',
      'karma-sourcemap-loader',
      'karma-chrome-launcher',
      // 'karma-phantomjs-launcher',
      'karma-requirejs',
      'karma-webpack',
      'karma-babel-preprocessor',
    ],

  })
}
