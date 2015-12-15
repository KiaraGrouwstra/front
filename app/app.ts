/// <reference path="../typings/tsd.d.ts" />

import 'reflect-metadata';
import {bootstrap, CORE_DIRECTIVES, FORM_DIRECTIVES, Component, View, ElementRef, Directive, Attribute, Injectable, Injector, Pipe,
    DynamicComponentLoader, ChangeDetectorRef, ComponentMetadata, Observable, ChangeDetectionStrategy} from 'angular2/angular2';
import {RouteConfig, Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_BINDINGS, Http} from 'angular2/http'; //Http, Headers
import {IterableDiffers} from 'angular2/src/core/change_detection/differs/iterable_differs';
//import { Observable } from '@reactivex/rxjs';  //, Subject, Subscriber, Subscription
import { MarkedPipe } from './pipes';
import WS from './ws';
let _ = require('lodash');
import Dummy from './dummy';
import { elemToArr, arrToArr, elemToSet, arrToSet, setToSet, loggers, notify } from './rx_helpers';
//import { notify } from './js.js';
import { parseVal } from './parser';

let providers = [ROUTER_PROVIDERS];
let directives = [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES];
let pipes = [MarkedPipe];
let regex_escape = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
let STYLES = [
  require('materialize-css/dist/css/materialize.min.css'),
  require('./style.less')
]

@Component({
  selector: 'app',
  providers: providers, // one instance per component
  //changeDetection: ChangeDetectionStrategy.CheckAlways,
})
@View({
  template: require('./jade/materialize.jade'),
  styles: STYLES,
  directives: directives,
  pipes: pipes,
})
export class App {
  deps: any;
  ws: WS;
  items: any;
  rows: any;
  cols: any;

  constructor(dcl: DynamicComponentLoader, el_ref: ElementRef, inj: Injector, cdr: ChangeDetectorRef, http: Http) {
    this.deps = { dcl: dcl, el_ref: el_ref, inj: inj, cdr: cdr, http: http };
    //this.ws = new WS();
    global.ws = this.ws;
    //dcl.loadAsRoot(Dummy, "#foo", inj);

    /*
    let arr = [{a: 1, b: 3},{a: 2, b: 4}];
    let obs = Observable.fromArray(arr);
    //obs.toArray().subscribe("obs", e => console.log(e));
    //let obs = this.ws.out.map(e => e['body']); //.pluck('body')
    global.obs = obs;
    // ^ can't populate with an Observable that doesn't terminate!

    this.rows = obs.toArray();

    this.cols = obs
      .map(x => Object.keys(x))
      .scan(arrToSet, new Set)
      .last();

    notify(obs, "obs");
    notify(this.rows, "rows");
    notify(this.cols, "cols");
    */

    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
    .forEach((x) => setTimeout(() => { cdr.detectChanges(); }, x * 1000));

    let pars = this.deps.http
      .get('./swagger/instagram.json')
      .map(_ => JSON.parse(_._body))
    //pars.subscribe(_ => this.loadHtmlTo('swagger', _, require('./jade/swagger.jade')))
    //notify(pars, "pars");
    //this.loadHtmlTo('swagger', pars, require('./jade/swagger.jade'));

    let $RefParser = require('json-schema-ref-parser');
    let swag = this.deps.http
    .get('./swagger/swagger.json')
    .map(_ => _._body)
    .map(_ => {
      let esc = regex_escape("http://json-schema.org/draft-04/schema");
      return _.replace(new RegExp(esc, 'g'), "/swagger/schema.json");
    })
    .map(_ => JSON.parse(_))
    .subscribe(_ => {
      $RefParser.dereference(_)
      .then((schema) => {
        //pars.subscribe(insta => this.loadHtmlTo('test', insta, html));
        pars.subscribe(insta => {
          //let el = parseVal([], insta, schema);
          //let html = el.outerHTML;
          let html = parseVal([], schema);
          //console.log(html);
          this.loadHtmlTo('test', insta, html);
        });
      })
      /*
      .catch(function(err) {
        console.error("err", err);
      });
      */
    })

  }

  // fetch a URL
  addUrl = (url) => {
    return this.ws.ask("/urls", {urls: url}, "url") //, headers: []
  }

  // fetch a URL and extract its contents based on a json parselet, with a callback to insert it into the view.
  parsley = (url, json) => {
    let pars = {url: url, parselet: json};
    return this.ws.ask("/parse", pars, "parsley")
  }

  // given a curl command, try out different combinations of headers to see which work, putting results in a table.
  toCurl = (str: string) => {
    let found = str.match(/-H '([^']+)'/g);
    let url = /'[^']+(?=')/.exec(str)[0].substr(1);
    let headers = _.zipObject(found.map(x =>
      /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
    ));
    let n = Object.keys(headers).length + 2;  // based on the current server implementation of 'try without each + all/none'
    return this.ws.ask_n(n, "/check", {urls: url, headers: headers}, "curl");
  }

  // insert a table component populated with an Observable (separate rows)
  // I've been fumbling around to get it to populate from (ws) Observable properly, though so far no dice.
  // Possibly related to the `detectChanges()` bug on `loadAsRoot()` though, so maybe wait it out...
  // In order to navigate to separate rows, use [json-path](https://github.com/search?q=JsonPath)? possibly also Rx flatten?
  makeTable = (obs: Observable<any>, to = 'table') => {
    let rows = obs.toArray();
    let cols = obs
      .map(x => Object.keys(x))
      .scan(arrToSet, new Set)
      .last();
    //let cols = rows.map(x => Object.keys(x)).scan(arrToSet, new Set);
    notify(rows, "rows");
    notify(cols, "cols");
    let pars = { rows: rows, cols: cols };
    //let pars = { rows: [], cols: new Set([]) };
    //let comp =
    this.loadHtmlTo(to, pars, require('./jade/table.jade'));
    //rows.subscribe(e => comp.rows = e);
    //cols.subscribe(e => comp.cols = e);
    //rows.subscribe(e => { comp.rows = e; this.deps.cdr.detectChanges(); });
    //cols.subscribe(e => { comp.cols = e; this.deps.cdr.detectChanges(); });

    //[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
    //.forEach((x) => setTimeout(() => { this.deps.cdr.detectChanges(); }, x * 1000));
  }

  // generate a component and place it at a given location (based on a template variable name)
  loadHtmlTo = (id: string, pars: {}, template: string, deps = []) => {
    let comp = this.genClass(pars, template);
    return this.deps.dcl.loadAsRoot(comp, "#"+id, this.deps.inj);
    //return this.deps.dcl.loadIntoLocation(comp, this.deps.el_ref, id, deps);
  }

  // dynamically generate a class using the given template and property values e.g. {a: foo, bar: val}
  genClass = (pars: {}, template: string) => {
    var comp: any = class {
      constructor(cdr: ChangeDetectorRef) {
        for (var k in pars) this[k] = pars[k];
        let update = () => { cdr.detectChanges() };
        setTimeout(update, 5000);
        // ^ ugly workaround to `loadAsRoot`: https://github.com/angular/angular/issues/3474
        // still causes an exception with observables too -_-;
      }
    }
    comp.parameters = [ChangeDetectorRef];
    comp.annotations = [new ComponentMetadata({
      selector: 'comp',  // no name clash?
      providers: providers,
      directives: directives,
      pipes: pipes,
      template: template,
      styles: STYLES,
    })];
    return comp;
  }

}

// I need to figure out how I can safely move this crap to main.js...
// I think combining webpack plus whatever Angular added is complicating things.
///*
//import {bootstrap} from 'angular2/angular2';
let singletons = [WS, HTTP_BINDINGS]; //Http
bootstrap(App, singletons).catch(err => console.error(err));

//Materialize
global.$ = global.jQuery = require("jquery");
require("materialize-css/dist/js/materialize.min");
(function($){
  $(function(){
    $('.button-collapse').sideNav();
  })
})(global.$)
//*/
