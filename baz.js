console.log('global', global);
var window = global;
console.log('window', window);

// require('reflect-metadata');
var core = require('jasmine-core');
var karma = require('karma-jasmine');
// var ng2 = require('angular2/testing');
var jasmine = require('jasmine-core/lib/jasmine-core/jasmine.js');
// var html = require('jasmine-core/lib/jasmine-core/jasmine-html.js');
var boot = require('jasmine-core/lib/jasmine-core/boot.js');

console.log('core', core.describe);
console.log('karma', karma.describe);
// console.log('ng2', ng2.describe);
console.log('jasmine', jasmine.describe);
// console.log('html', html.describe);
// console.log('boot', boot.describe);

//describe('foo', function() {});
