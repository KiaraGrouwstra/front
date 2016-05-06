import 'reflect-metadata';
import 'zone.js/dist/zone';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';

Error.stackTraceLimit = Infinity; //1 3 5 8 Infinity
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

require('@angular/platform-browser/src/browser/browser_adapter').BrowserDomAdapter.makeCurrent();

import { setBaseTestProviders } from '@angular/core/testing';
import { TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS as PLATFORM, TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS as APPLICATION } from '@angular/platform-browser-dynamic/testing/browser';
// import { TEST_BROWSER_STATIC_PLATFORM_PROVIDERS as PLATFORM, TEST_BROWSER_STATIC_APPLICATION_PROVIDERS as APPLICATION } from '@angular/platform-browser/testing/browser';
// import { TEST_SERVER_PLATFORM_PROVIDERS as PLATFORM, TEST_SERVER_APPLICATION_PROVIDERS as APPLICATION } from '@angular/platform-server/testing/server';
setBaseTestProviders(PLATFORM, APPLICATION);

global._ = require('lodash/fp');
global.$ = global.jQuery = require('jquery');

const requireAll = function(ctxt) { ctxt.keys().map(ctxt); };
requireAll(require.context('./app', true, /\.spec\.[tj]s$/));
