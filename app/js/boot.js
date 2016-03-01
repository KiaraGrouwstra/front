require("./styles");
import "babel-core/register";
import "babel-polyfill";

import 'angular2/bundles/angular2-polyfills.js';
import { App } from './app';
import { bootstrap } from 'angular2/platform/browser';
// <script src="node_modules/angular2/bundles/router.dev.js"></script>
import { ROUTER_PROVIDERS } from 'angular2/router';
import { HTTP_BINDINGS } from 'angular2/http'; //Http, Headers
import { WS } from './ws';
import { provide } from 'angular2/core';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';

let singletons = [WS, HTTP_BINDINGS, ROUTER_PROVIDERS,
  provide(ChangeDetectorGenConfig, {useValue: new ChangeDetectorGenConfig(false, false, false)}),
];
bootstrap(App, singletons).catch(err => console.error(err));

//Materialize
global.$ = global.jQuery = require("jquery");
require("materialize-css/dist/js/materialize");
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
})(global.$)
