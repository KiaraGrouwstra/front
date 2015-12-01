/// <reference path="../typings/tsd.d.ts" />

import 'reflect-metadata';
import {bootstrap, CORE_DIRECTIVES, FORM_DIRECTIVES, Component, View, ElementRef, Directive, Attribute, DynamicComponentLoader, Injectable, Injector, ChangeDetectorRef, ComponentMetadata} from 'angular2/angular2';
import {RouteConfig, Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {Http, Headers} from 'angular2/http';
//import {IterableDiffers} from 'angular2/src/core/change_detection/differs/iterable_differs';

let providers = [ROUTER_PROVIDERS]; //, IterableDiffers
let directives = [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES];  //adapter.upgradeNg1Component('ngMaterial')

import WS from './ws.ts';
var _ = require('lodash');

//Materialize
global.$ = global.jQuery = require("jquery");
require("materialize-css/dist/js/materialize.min");

// //import {UpgradeAdapter} from 'angular2/upgrade';
//var adapter = new UpgradeAdapter();

@Component({
  providers: providers, // one instance per component
  selector: 'app'
})
@View({
  directives: directives,
  styles: [
    require('materialize-css/dist/css/materialize.min.css'),
    require('./style.less')
  ],
  template: require('./materialize.jade')
})
export class App {
  deps: any;
  ws: WS;
  //items: Array<any>;
  //data: Array<any> = []; // default data
  //pass in variables to automate their declaration/assignment

  constructor(loader: DynamicComponentLoader, el_ref: ElementRef, inj: Injector) {
    this.deps = {loader: loader, el_ref: el_ref, inj: inj};
    this.ws = new WS();
    global.ws = this.ws;
    //this.items = [];
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
    return this.deps.loader.loadAsRoot(Comp, "#"+id, this.deps.inj);
    //return this.deps.loader.loadIntoLocation(Comp, this.deps.el_ref, id, deps);
  }

  // dynamically generate a class using the given template and property values e.g. {a: foo, bar: val}
  genClass = (pars: any, template: string) => {
    var comp: any = class {
      constructor(cdr: ChangeDetectorRef) {
        for (var k in pars) this[k] = pars[k];
        let update = () => { cdr.detectChanges(); }
        setTimeout(update, 5000);
        // ^ ugly workaround to `loadAsRoot`: https://github.com/angular/angular/issues/3474
      }
    }
    comp.parameters = [ChangeDetectorRef];
    comp.annotations = [new ComponentMetadata({
      selector: 'comp',  // no name clash?
      providers: providers,
      directives: directives,
      template: template
    })]
    return comp;
  }

}

bootstrap(App, [WS]); // injected singletons
//, Injector
// ^ injector errors here!
//, ChangeDetectorRef
//, IterableDiffers
//bootstrap(App, [WS]);
//ROUTER_PROVIDERS

(function($){
  $(function(){

    $('.button-collapse').sideNav();

  }); // end of document ready
})(global.$); // end of jQuery name space
