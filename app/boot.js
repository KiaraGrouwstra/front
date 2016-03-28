require('./styles');
import 'babel-core/register';
import 'babel-polyfill';

import 'angular2/bundles/angular2-polyfills.js';
import { bootstrap } from 'angular2/platform/browser';
// // <script src="node_modules/angular2/bundles/router.dev.js"></script>
import { ROUTER_PROVIDERS } from 'angular2/router';
import { HTTP_BINDINGS } from 'angular2/http';
import { provide } from 'angular2/core';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';

import { App } from './comps/fat/app/app';
import { WS } from './comps/services/ws/ws';

let singletons = [
  HTTP_BINDINGS, ROUTER_PROVIDERS,
  WS,
  provide(ChangeDetectorGenConfig, { useValue: new ChangeDetectorGenConfig(false, false, false) }),
];
bootstrap(App, singletons).catch(err => console.error('ERROR CAUGHT BY BOOT:' + err));

window._ = require('lodash/fp');
window.$ = window.jQuery = require('jquery');
//Materialize
require('materialize-css/dist/js/materialize');
(function($){
  $(function(){
    $('.button-collapse').sideNav();
    $('.collapsible').collapsible({});
    $('.tooltipped').tooltip({delay: 50});
    /*
    $('select').material_select();
    $('.datepicker').pickadate({ selectMonths: true, selectYears: 15 });
    $('ul.tabs').tabs();
    */
  })
})(window.$)
