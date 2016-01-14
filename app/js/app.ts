// /// <reference path="../typings/tsd.d.ts" />

import 'reflect-metadata';
import { Component, View, ElementRef, Directive, Attribute, Injectable, Injector, Pipe, OnInit, EventEmitter,
    DynamicComponentLoader, ChangeDetectorRef, ComponentMetadata, ChangeDetectionStrategy } from 'angular2/core';
import { CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm, FormBuilder, Control, Validators } from 'angular2/common';
import { Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteParams } from 'angular2/router';
import { HTTP_BINDINGS, Http } from 'angular2/http'; //Http, Headers
import { IterableDiffers } from 'angular2/src/core/change_detection/differs/iterable_differs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/forkJoin';
// https://github.com/ReactiveX/RxJS/tree/master/src/add/operator
global.Observable = Observable;
import { MarkedPipe } from './pipes';
import WS from './ws';
let _ = require('lodash');
// import Dummy from './dummy';
import { elemToArr, arrToArr, elemToSet, arrToSet, setToSet, loggers, notify } from './rx_helpers';
import { Object_filter, Array_has, handle_auth, popup, toast, setKV, getKV, Prom_do, Prom_finally, spawn_n, arr2obj, do_return, RegExp_escape, String_stripOuter, prettyPrint } from './js.js';
import { parseVal } from './output';
import { method_form } from './input';
let marked = require('marked');
import { gen_comp, form_comp } from './dynamic_class';
let Immutable = require('immutable');
String.prototype.stripOuter = String_stripOuter;
// import { ColoredComp } from './colored';
import { ScalarComp } from './scalar';
import { load_ui, load_auth_ui, load_fn_ui, get_submit } from './ui';

let directives = [CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm, ROUTER_DIRECTIVES, ScalarComp];  //, ColoredComp
let pipes = [MarkedPipe];

Promise.prototype.finally = Prom_finally;
Promise.prototype.do = Prom_do;
Array.prototype.has = Array_has;

// let backbone = require('backbone');
//require('pretty-json/pretty-json-debug');   //import { PrettyJSON } from
//require('http://warfares.github.io/pretty-json/pretty-json-min.js');
// require('../vendor/pretty-json-min');

@Component({
  selector: 'app',
  //changeDetection: ChangeDetectionStrategy.CheckAlways,
})
@View({
  template: require('../jade/ng-output/materialize.jade'),
  directives: directives, // one instance per component
  pipes: pipes,
})
@RouteConfig([
//   {path:'/test',          name: 'CrisisCenter', component: genClass({}, html) },
//   {path:'/hero/:id',      name: 'HeroDetail',   component: HeroDetailComponent},
])
// <router-outlet></router-outlet>
export class App {
  deps: any;
  ws: WS;
  items: any;
  rows: any;
  cols: any;
  auths: {};
  json: EventEmitter<any>;
  raw: Observable<string>;
  colored: Observable<string>;
  rendered: Observable<string>;
  auth: any;
  functions: any;
  inputs: any;
  apis: Array<string>;
  oauth_misc: {};
  //api: string;
  swagger: {};
  api_spec: {};
//   swagger: EventEmitter<{}>;
//   api_spec: EventEmitter<{}>;
  a: any;
  b: any;
  c: any;
  //self: any; //AppComponent;
  val_path: any;
  schema_path: any;

  constructor(dcl: DynamicComponentLoader, router:Router, //routeParams: RouteParams, <-- for sub-components with router params: routeParams.get('id')
        el_ref: ElementRef, inj: Injector, cdr: ChangeDetectorRef, http: Http) {
    this.deps = { dcl: dcl, el_ref: el_ref, inj: inj, cdr: cdr, http: http };
    this.ws = new WS("ws://127.0.0.1:8080/socket", "rooms:lobby", () => toast.success('websocket connected!'), () => toast.warn('websocket disconnected!'));
    global.ws = this.ws;
    global.app = this;
    this.auths = {};
    this.json = new EventEmitter();
    setTimeout(() =>
        this.json.emit({test: "lol"})
    , 1000)
    this.raw = this.json.map((o) => JSON.stringify(o));
    this.colored = this.json.map(x => prettyPrint(x));
    this.rendered = this.json.map(o => parseVal([], o, {}))
    // this.json.subscribe((o) => new window.PrettyJSON.view.Node({el: $('#expandable'), data: o }).expandAll());
    global.Control = Control;
    //let pollTimer = window.setInterval(this.refresh, 500);
    //dcl.loadAsRoot(Dummy, "#foo", inj);
    this.apis = ['instagram', 'github'];
    let api = this.apis[0];
    this.apis.forEach(name => getKV(name).then((v) => {
        this.auths[name] = v;
        if(name == api) $('#scope-list .collapsible-header').click();
    }));
    this.a = [];
    this.b = 'foo';
    this.c = {};
    this.val_path = 'b';
    this.schema_path = 'c';
    //this.val_path = new EventEmitter().startWith('b');
    //notify(this.val_path, 'val_path');
    //this.schema_path = new EventEmitter().startWith('c');
    //notify(this.schema_path, 'schema_path');
    //this.a = JSON.stringify([]);
    //this.b = JSON.stringify('foo');
    //this.c = JSON.stringify({});
    //this.self = this;
    //this.self = JSON.stringify(this);
    //console.log('this', this);
    //console.log('self', this.self);

    // https://github.com/simov/grant/blob/master/config/oauth.json
    this.oauth_misc = require('../vendor/oauth.json');
    //authorize_url, access_url, oauth, scope_delimiter
    // other crap: https://grant-oauth.herokuapp.com/providers

    this.handle_implicit(window.location);

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

    //spawn_n(() => this.refresh(), 30);

    this.load_ui(api);

  }

  refresh = () => {
    this.deps.cdr.detectChanges();
  }

  // fetch a URL
  addUrl = (url) => {
    return this.ws.ask("/urls", {urls: url}, "url"); //, headers: []
  }

  // fetch a URL and extract its contents based on a json parselet, with a callback to insert it into the view.
  parsley = (url, json) => {
    let pars = {url: url, parselet: json};
    return this.ws.ask("/parse", pars, "parsley");
  }

  // given a curl command, try out different combinations of headers to see which work, putting results in a table.
  toCurl = (str: string) => {
    let found = str.match(/-H '([^']+)'/g);
    let url = /'[^']+(?=')/.exec(str)[0].substr(1);
    let headers = _.object(found.map(x =>
      /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
    ));
    let n = Object.keys(headers).length + 2;  // based on the current server implementation of 'try without each + all/none'
    return this.ws.ask_n(n, "/check", {urls: url, headers: headers}, "curl");
  }

  // insert a table component populated with an Observable (separate rows)
  // failed to populate from (ws) Observable, maybe due to `detectChanges()` bug on `loadAsRoot()`; wait?
  // to navigate to separate rows, use [json-path](https://github.com/search?q=JsonPath)? Rx flatten?
  makeTable = (obs: Observable<any>, to = 'table') => {
    let rows = obs.toArray();
    let cols = obs
      .map(x => Object.keys(x))
      .scan(arrToSet, new Set)
      .last();
    //notify(rows, "rows");
    //notify(cols, "cols");
    let pars = { rows: rows, cols: cols };
    this.loadHtml(to, pars, require('../jade/ng-output/table-a.jade'));

    //spawn_n(() => this.refresh(), 30)
  }

  // generate a component and place it at a given location (based on a template variable name)
  loadHtml = (id: string, pars: {}, template: string, comp = gen_comp) =>  //, deps = []
    this.loadComp(id, this.genClass(pars, template, comp)) //, deps

  // inject a component to a given location
  loadComp = (id: string, comp: any) => //, deps = []
    this.deps.dcl.loadAsRoot(comp, "#"+id, this.deps.inj)
    //this.deps.dcl.loadIntoLocation(comp, this.deps.el_ref, id, deps)
    .then(x => x.instance)
    //.do(x => this.refresh())
    .then(do_return(x => this.refresh()))

  // dynamically generate a class using the given template and property values e.g. {a: foo, bar: val}
  genClass = (pars: {}, template: string, comp_cls = gen_comp) => {
    let comp = comp_cls(pars);
    comp['parameters'] = [ChangeDetectorRef, FormBuilder];
    comp['annotations'] = [new ComponentMetadata({
      selector: 'comp',  // no name clash?
      //providers: providers,
      directives: directives,
      pipes: pipes,
      template: template,
    })];
    // console.log('cls', comp);
    return comp;
  }

  // sets and saves the auth token + scopes from the given get/hash
  handle_implicit = (url) => handle_auth(url, (get, hash) => {
    let name = get['callback'];
    let delim = _.get(this.oauth_misc, [name, 'scope_delimiter'], ' ');
    let auth = {
      name: name,
      token: hash['access_token'],
      scopes_have: get['scope'].replace(/\+/g, ' ').split(delim),
    };
    this.auths[name] = auth;
    //localStorage.setItem(name, JSON.stringify(auth));
    setKV(name, auth);
  })

  load_ui = load_ui
  load_auth_ui = load_auth_ui
  load_fn_ui = load_fn_ui

}
