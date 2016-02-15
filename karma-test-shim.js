require('babel-polyfill');
// require('phantomjs-polyfill');
require('es6-promise');
require('es6-shim');
require('reflect-metadata');
require('zone.js/dist/zone-microtask.js');
// require('zone.js/dist/long-stack-trace-zone.js');
// require('zone.js/dist/jasmine-patch.js');

// source: http://twofuckingdevelopers.com/2016/01/testing-angular-2-with-karma-and-jasmine/
// original: https://github.com/juliemr/ng2-test-seed/blob/master/karma-test-shim.js

Error.stackTraceLimit = 5; //5 8 Infinity
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

require('angular2/src/platform/browser/browser_adapter').BrowserDomAdapter.makeCurrent();

// beta 3
//import {setBaseTestProviders} from 'angular2/testing';
//import { TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS } from 'angular2/platform/testing/browser';
// setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);
//var server = require('angular2/platform/testing/server');
var browser = require('angular2/platform/testing/browser');
require('angular2/testing').setBaseTestProviders(
  browser.TEST_BROWSER_PLATFORM_PROVIDERS, browser.TEST_BROWSER_APPLICATION_PROVIDERS);
  //server.TEST_SERVER_PLATFORM_PROVIDERS, server.TEST_SERVER_APPLICATION_PROVIDERS);

const requireAll = function(ctxt) { ctxt.keys().map(ctxt); };
requireAll(require.context('./app/js', true, /\.spec\.[tj]s$/));
