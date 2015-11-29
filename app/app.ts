/// <reference path="../typings/tsd.d.ts" />

import 'reflect-metadata';
import {Directive, Component, View, ElementRef, Attribute, DynamicComponentLoader, Injectable, bootstrap, CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {RouteConfig, Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {Http, Headers} from 'angular2/http';
import {IterableDiffers} from 'angular2/src/core/change_detection/differs/iterable_differs';

import WS from './ws.ts';
var _ = require('lodash');

//Materialize
global.$ = global.jQuery = require("jquery");
require("materialize-css/dist/js/materialize.min");

// //import {UpgradeAdapter} from 'angular2/upgrade';
//var adapter = new UpgradeAdapter();

@Component({
  providers: [ROUTER_PROVIDERS, IterableDiffers],
  selector: 'app'
})
@View({
  directives: [
    //adapter.upgradeNg1Component('ngMaterial'),
    CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES
  ],
  styles: [
    require('materialize-css/dist/css/materialize.min.css'),
    require('./style.less')
  ],
  template: require('./materialize.jade')
})
export class App {
  deps: any;
  ws: WS;
  foo: string;
  //items: Array<any>;
  //data: Array<any> = []; // default data
  //pass in variables to automate their declaration/assignment

  constructor(loader: DynamicComponentLoader) {
    this.deps = {loader: loader};
    this.ws = new WS();
    global.ws = this.ws;
    //this.items = [];
    this.foo = "table";
  }

  // fetch a URL
  addUrl = (url) => {
    this.ws.request("/urls", {urls: url}) //, headers: []
  }

  // fetch a URL and extract its contents based on a json parselet, with a callback to insert it into the view.
  parsley = (url, parselet) => {
    let pars = {url: url, parselet: parselet}
    let cb = (data, info) => { console.log("thenning!: " + JSON.stringify(data.body)) }
    this.ws.request("/parse", pars, {cb: cb})
  }

  // given a curl command, try out different combinations of headers to see which work, putting results in a table.
  toCurl = (str: string) => {
    let found = str.match(/-H '([^']+)'/g);
    let url = /'[^']+(?=')/.exec(str)[0].substr(1);
    let headers = _.object(found.map(x =>
      /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
    ));
    this.makeTable((info) => {
      this.ws.request("/check", {urls: url, headers: headers}, info);
    });
  }

  // generate a table component with a callback to populate it through `this.ws.request`.
  makeTable = (fn: any, to = 'table') => {
    let pars = {rows: [], cols: new Set([])};
    this.loadHtmlTo(to, pars, require('./table.jade')).then((c) => {
      let obj = c.instance;
      let info = {cols: obj.cols, rows: obj.rows, cb: this.ws.handle_table};
      fn(info);
    })
  }

  // generate a component and place it at a given location (based on a template variable name)
  loadHtmlTo = (id: string, pars: any, template: string, deps = []) => {
    let Comp = this.genClass(pars, template);
    return this.deps.loader.loadAsRoot(Comp, "#"+id, null);
  }

  // dynamically generate a class using the given template and property values e.g. {a: foo, bar: val}
  genClass = (pars: any, template: string) => {
    @Component({
      providers: [ROUTER_PROVIDERS, IterableDiffers],
      selector: 'comp'
    }) // no name clash, yay
    @View({
      template: template,
      directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES]
    })
    class Comp {
      constructor() {
        for (var k in pars) {
          this[k] = pars[k];
        }
      }
    };
    return Comp;
  }

}

//bootstrap(App, [WS, IterableDiffers]);
bootstrap(App, [WS]);
//ROUTER_PROVIDERS

(function($){
  $(function(){

    $('.button-collapse').sideNav();

  }); // end of document ready
})(global.$); // end of jQuery name space
