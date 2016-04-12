require('./styles');
import 'babel-core/register';
import 'babel-polyfill';

// https://github.com/angular/angular/issues/5169
"format register";
interface System {
  register: Function
}
System.register("angular2/src/core/change_detection/pipe_lifecycle_reflector", [], true, function(require, exports, module) {
  exports.implementsOnDestroy = (pipe) => pipe ? pipe.constructor.prototype.ngOnDestroy : false
})

import 'angular2/bundles/angular2-polyfills.js';
import { bootstrap } from 'angular2/platform/browser';
// // <script src="node_modules/angular2/bundles/router.dev.js"></script>
import { ROUTER_PROVIDERS } from 'angular2/router';
import { HTTP_BINDINGS } from 'angular2/http';
import { provide, enableProdMode } from 'angular2/core';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';

import { App } from './comps/fat/app/app';
import { RequestService } from './comps/services/request/request';
import { requestServiceProvider } from './comps/services/request/request.provider';
import { WsService } from './comps/services/ws/ws';
import { wsServiceProvider } from './comps/services/ws/ws.provider';
import { CONFIG, APP_CONFIG } from './config';

let singletons = [
  HTTP_BINDINGS, ROUTER_PROVIDERS,
  requestServiceProvider,
  wsServiceProvider,
  provide(APP_CONFIG, { useValue: CONFIG }),
  provide(ChangeDetectorGenConfig, { useValue: new ChangeDetectorGenConfig(false, false, false) }),
];
enableProdMode();
bootstrap(App, singletons).catch(err => console.error('ERROR CAUGHT BY BOOT:' + err));

window._ = require('lodash/fp');
window.$ = window.jQuery = require('jquery');
//Materialize
require('materialize-css/dist/js/materialize');
window.noUiSlider = require('materialize-css/extras/noUiSlider/nouislider');
(function($){
  $(function(){
    Waves.displayEffect();
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
