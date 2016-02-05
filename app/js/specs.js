console.log("SPECS");

// https://github.com/AngularClass/angular2-webpack-starter/blob/master/spec-bundle.js

//karma part
// require("babel-polyfill");
// var jasmine = require("jasmine-core");
// require("jasmine-core/lib/jasmine-core/jasmine");
// require("jasmine-core/lib/jasmine-core/jasmine-html");
// require("jasmine-core/lib/jasmine-core/boot");

// from angular2-webpack-starter
// require('phantomjs-polyfill');
// require('es6-promise');
// require('es6-shim');
// require('es7-reflect-metadata/dist/browser');
// require('zone.js/lib/browser/zone-microtask.js');
// require('zone.js/lib/browser/long-stack-trace-zone.js');
// require('zone.js/dist/jasmine-patch.js');
// import "babel-polyfill";
// import "es6-promise";
// import "es6-shim";
// import "reflect-metadata";
// import "zone.js/dist/zone-microtask";
// import "zone.js/dist/long-stack-trace-zone";
// import "angular2/platform/browser";
// import "angular2/platform/common_dom";
// import "angular2/core";
// import "angular2/router";
// import "angular2/http";
// import "angular2/testing";
// import "rxjs";
// var testing = require('angular2/testing');
// var browser = require('angular2/platform/testing/browser');
// testing.setBaseTestProviders(
//   browser.TEST_BROWSER_PLATFORM_PROVIDERS,
//   browser.TEST_BROWSER_APPLICATION_PROVIDERS);

import 'reflect-metadata';
var ctxt = require.context('./', true, /\.spec\.[jt]s/);
ctxt.keys().forEach(ctxt);
// const requireAll = (ctxt) => ctxt.keys().map(ctxt); //poor man's Object.values()?
// requireAll(require.context('./', true, /\.spec\.[tj]s$/));
console.log(`LOL`);
// console.log(require.context('./', true, /\.spec\.[tj]s$/));

describe('stuff', () => {
  it('true is false', () => expect(true).toEqual(false));
});

console.log("END SPECS");
