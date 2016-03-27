/// <reference path="../typings/tsd.d.ts" />

import 'reflect-metadata';
import { Component, ElementRef, Directive, Attribute, Injectable, Injector, Pipe, OnInit, EventEmitter, ViewChild,
    DynamicComponentLoader, ChangeDetectorRef, ComponentMetadata, ChangeDetectionStrategy, Inject } from 'angular2/core';
import { CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm, FormBuilder, Control, Validators } from 'angular2/common';
import { Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteParams } from 'angular2/router';
import { HTTP_BINDINGS, Http } from 'angular2/http'; //Http, Headers
// import { IterableDiffers } from 'angular2/src/core/change_detection/differs/iterable_differs';
import { Observable } from 'rxjs/Observable';
// import { Subject } from 'rxjs/subject/Subject';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/forkJoin';
// https://github.com/ReactiveX/RxJS/tree/master/src/add/operator
// global.Observable = Observable;
global.Rx = require('rxjs');
global.ng = require('angular2/core');
import { MarkedPipe } from './pipes';
import WS from './ws';
let _ = require('lodash/fp');
// import Dummy from './dummy';
import { arrToSet, notify } from './rx_helpers';  //elemToArr, arrToArr, elemToSet, setToSet, loggers,
import { Object_filter, Array_has, handle_auth, popup, toast, setKV, getKV, Prom_do, Prom_finally, spawn_n, arr2obj, do_return, RegExp_escape, String_stripOuter, prettyPrint, ng2comp } from './js.js';
import { input_specs } from './input';  //method_form, make_form,
// import { parseVal } from './output';
// let marked = require('marked');
// import { gen_comp } from './dynamic_class'; //, form_comp
let Immutable = require('immutable');
// String.prototype.stripOuter = String_stripOuter;
// import { ColoredComp } from './colored';
//import { ScalarComp } from './scalar';
//import { ULComp } from './ul';
import { ValueComp } from './comps/value';
// import { ObjectComp } from './comps/object';
// import { DLComp } from './comps/dl';
import { load_ui, get_submit, req_url, pick_fn, extract_url, doCurl } from './ui'; //, load_auth_ui, load_fn_ui, load_scrape_ui
// import { autobind, mixin, decorate } from 'core-decorators';  // @decorate(_.memoize)
import { AuthUiComp } from './auth_ui';
import { FnUiComp } from './fn_ui';
import { InputUiComp } from './input_ui';
// import { ScrapeUiComp } from './scrape_ui';
import { FormComp } from './comps/input-form';
// import { ViewEncapsulation } from 'angular2/core';

let directives = [CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm, ROUTER_DIRECTIVES, ValueComp, AuthUiComp, FnUiComp, InputUiComp, FormComp];  //, ScalarComp, ULComp, ObjectComp, DLComp, ScrapeUiComp
let pipes = [MarkedPipe];

// Promise.prototype.finally = Prom_finally;
// Promise.prototype.do = Prom_do;
//Array.prototype.has = Array_has;

// let backbone = require('backbone');
//require('pretty-json/pretty-json-debug');   //import { PrettyJSON } from
//require('http://warfares.github.io/pretty-json/pretty-json-min.js');
// require('../vendor/pretty-json-min');

export let App = ng2comp({
  component: {
    selector: 'app',
    //changeDetection: ChangeDetectionStrategy.CheckAlways,
    template: require('../jade/ng-output/materialize'),
    directives: directives, // one instance per component   //viewDirectives: private from ng-content
    pipes: pipes,
    // encapsulation: ViewEncapsulation.Native,
  },
  parameters: [
    DynamicComponentLoader,
    Router,
    ElementRef,
    Injector,
    ChangeDetectorRef,
    Http,
  ],
  decorators: {
    v: ViewChild(ValueComp),
    auth_ui: ViewChild(AuthUiComp),
    fn_ui: ViewChild(FnUiComp),
    input_ui: ViewChild(InputUiComp),
    // scrape_ui: ViewChild(ScrapeUiComp),
  },
  class: class App {
    // .class({
    // @autobind class App {
    //   deps: any;
    //   ws: WS;
    //   items: any;
    //   rows: any;
    //   cols: any;
    //   auths: {};
    //   json: BehaviorSubject<any>;
    //   raw: Observable<string>;
    //   colored: Observable<string>;
    //   //rendered: Observable<string>;
    //   auth: any;
    //   functions: any;
    //   inputs: any;
    //   apis: Array<string>;
    //   oauth_misc: {};
    //   //api: string;
    //   swagger: {};
    //   api_spec: {};
    // //   swagger: BehaviorSubject<{}>;
    // //   api_spec: BehaviorSubject<{}>;
    //   a: any;
    //   b: any;
    //   c: any;
    //   d: any;
    //   val_path: any;
    //   schema_path: any;
    //   obs: Observable<any>;

      constructor(
        // @Inject(DynamicComponentLoader) dcl: DynamicComponentLoader,
        // @Inject(Router) router: Router,
        // @Inject(ElementRef) el_ref: ElementRef,
        // @Inject(Injector) inj: Injector,
        // @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
        // @Inject(Http) http: Http
        // @Inject(DynamicComponentLoader) dcl,
        // @Inject(Router) router,
        // @Inject(ElementRef) el_ref,
        // @Inject(Injector) inj,
        // @Inject(ChangeDetectorRef) cdr,
        // @Inject(Http) http
        // dcl: DynamicComponentLoader,
        // router: Router,
        // el_ref: ElementRef,
        // inj: Injector,
        // cdr: ChangeDetectorRef,
        // http: Http
        dcl,
        router,
        el_ref,
        inj,
        cdr,
        http
        //routeParams: RouteParams, <-- for sub-components with router params: routeParams.get('id')
          ) {
        this.deps = { dcl: dcl, router: router, el_ref: el_ref, inj: inj, cdr: cdr, http: http };
        //this.ws = new WS(url = "ws://127.0.0.1:8080/socket", chan_name = "rooms:lobby", () => toast.success('websocket connected!'), () => toast.warn('websocket disconnected!'));
        //this.ws = new WS({ onOpen: () => toast.success('websocket connected!'), onClose: () => toast.warn('websocket disconnected!') });
        this.ws = new WS("ws://127.0.0.1:8080/socket", "rooms:lobby", () => toast.success('websocket connected!'), () => toast.warn('websocket disconnected!'));
        global.ws = this.ws;
        global.app = this;
        this.auths = {};
        this.data = {test: "lol"};
        global.Control = Control;
        //let pollTimer = window.setInterval(this.refresh, 500);
        //dcl.loadAsRoot(Dummy, "#foo", inj);
        this.apis = ['instagram', 'github', 'ganalytics'];
        let api = this.apis[0];
        this.apis.forEach(name => getKV(name).then((v) => {
          this.auths[name] = v;
          if(name == api) $('#scope-list .collapsible-header').click();
        }));
        // this.fn_path = null;
        this.spec = {};
        this.path = ['test'];
        // this.fn_ui_spec = null;
        this.fn_ui_oauth_sec = 'instagram_auth';
        // this.fn_ui_have = null;
        // this.auth_ui_name = null;
        // this.auth_ui_scopes = null;
        // this.auth_ui_oauth_info = null;
        // this.auth_ui_delim = null;
        // this.auth_ui_have = null;

        // testing alt. approach of that used in scrape_ui
        let curl_spec = [{
        	name: "curl",
        	type: "string",
        	required: true,
        	description: "CURL (bash) command as copied from Chrome's network tab",
          default: "curl 'https://detailskip.taobao.com/json/sib.htm?itemId=521372858018&sellerId=1979798612&p=1&rcid=124484008&sts=404492288,1170936092094889988,72057594037960704,4503603924500483&chnl=pc&price=3000&shopId=&vd=1&skil=false&pf=1&al=false&ap=1&ss=0&free=0&defaultCityId=110100&st=1&ct=1&prior=1&ref=' -H 'dnt: 1' -H 'accept-encoding: gzip, deflate, sdch' -H 'accept-language: en-US,en;q=0.8,nl;q=0.6,ja;q=0.4,zh;q=0.2,zh-CN;q=0.2,zh-TW;q=0.2,de;q=0.2' -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2452.0 Safari/537.36' -H 'accept: */*' -H 'cache-control: max-age=0' -H 'cookie: cna=1N2yDDXQjjoCAXbBNqyT5owh; thw=cn; uc3=nk2=F4%2B0H36sEg%3D%3D&id2=VWZ2FrcUdSGe&vt3=F8dASMunk2BSL1gwtQQ%3D&lg2=WqG3DMC9VAQiUQ%3D%3D; hng=CN%7Czh-cn%7CCNY; lgc=tycho01; tracknick=tycho01; _cc_=UIHiLt3xSw%3D%3D; tg=0; ucn=center; v=0; mt=ci=-1_0; cookie2=1c394919b47e6111c6279b7ddadd35c8; t=f47b09a247a1f9d820c2952d24f0aed5; _tb_token_=ebbe336e3b73e; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; uc1=cookie14=UoWzW98jWt%2F5oQ%3D%3D; isg=766D7D6644BB6A5AE37614EC2842F40F; l=AgQE-yl0rvSAeuw7zpWVQTiNVIz3XiiH' -H 'referer: https://item.taobao.com/item.htm?spm=a230r.1.14.51.VADz4n&id=521372858018&ns=1&abbucket=18' --compressed",
        }];
        this.curl = curl_spec.map(input_specs());

        // TODO: update so as to incorporate nesting
        let scrape_spec = [
          {
            name: 'url',
            type: 'string',
            format: 'url',
            required: true,
            description: 'the URL to scrape and extract',
          },
          {
            // type: 'array',
            // items: {
            type: 'object',
            additionalProperties: {
              type: 'string',
              // format: 'json',

              required: true,
              name: 'floki selector',
              description: "use CSS selectors, use e.g. `a@src` to get a URL's `src` attribute, `a` to get its text, or `a@` to get its outer html",
              // in: 'path',
            },
            minItems: 1,

            // required: true,
            name: 'parselet',
            description: 'json parselet',
            // in: 'path',
          },
        ];
        this.scrape_spec = scrape_spec.map(input_specs());

        //http://blog.mgechev.com/2016/01/23/angular2-viewchildren-contentchildren-difference-viewproviders/
        //@ContentChildren, @ContentChild
        //@ViewChildren, @ViewChild
        //TemplateRef

        // https://github.com/simov/grant/blob/master/config/oauth.json
        this.oauth_misc = require('../vendor/oauth.json');
        //authorize_url, access_url, oauth, scope_delimiter
        // other crap: https://grant-oauth.herokuapp.com/providers

        this.handle_implicit(window.location);

        /*
        let arr = [{a: 1, b: 3},{a: 2, b: 4}];
        let obs = Observable.fromArray(arr);
        //obs.toArray().subscribe("obs", e => console.log(e));
        //let obs = this.ws.out.map(e => e.body); //.pluck('body')
        global.obs = obs;
        // ^ can't populate with an Observable that doesn't terminate!

        this.rows = obs.toArray();

        this.cols = obs
          .map(x => Object.keys(x))
          .scan(arrToSet, new Set)
          .last();

        notify("obs", obs);
        notify("rows", this.rows);
        notify("cols", this.cols);
        */

        //spawn_n(() => this.refresh(), 30);

        this.load_ui(api);

      };

      get data() { return this._data; }
      set data(x) {
        this._data = x;
        this.raw = JSON.stringify(x);
        this.colored = prettyPrint(x);
      }

      refresh() {
        this.deps.cdr.detectChanges();
      };

      // // insert a table component populated with an Observable (separate rows)
      // // failed to populate from (ws) Observable, maybe due to `detectChanges()` bug on `loadAsRoot()`; wait?
      // // to navigate to separate rows, use [json-path](https://github.com/search?q=JsonPath)? Rx flatten?
      // makeTable(obs: Observable<any>, to = 'table') {
      //   let rows = obs.toArray();
      //   let cols = obs
      //     .map(x => Object.keys(x))
      //     .scan(arrToSet, new Set)
      //     .last();
      //   //notify("rows", rows);
      //   //notify("cols", cols);
      //   let pars = { rows: rows, cols: cols };
      //   this.loadHtml(to, pars, require('../jade/ng-output/table-a'));
      //
      //   //spawn_n(() => this.refresh(), 30);
      // };

      // // generate a component and place it at a given location (based on a template variable name)
      // loadHtml(id: string, pars: {}, template: string, comp = gen_comp) {  //, deps = []
      //   return this.loadComp(id, this.genClass(pars, template, comp)); //, deps
      // }
      //
      // // inject a component to a given location
      // loadComp(id: string, comp: any) { //, deps = []
      //   return this.deps.dcl.loadAsRoot(comp, "#"+id, this.deps.inj)
      //   //this.deps.dcl.loadIntoLocation(comp, this.deps.el_ref, id, deps)
      //   .then(x => x.instance)
      //   //.do(x => this.refresh())
      //   .then(do_return(x => this.refresh()));
      // }
      //
      // // dynamically generate a class using the given template and property values e.g. {a: foo, bar: val}
      // genClass(pars: {}, template: string, comp_cls = gen_comp) {
      //   return ng2comp({
      //     class: comp_cls(pars),
      //     parameters: [ChangeDetectorRef, FormBuilder],
      //     component: {
      //       directives: directives,
      //       pipes: pipes,
      //       template: template,
      //     },
      //   })
      // };

      // sets and saves the auth token + scopes from the given get/hash
      handle_implicit = (url) => handle_auth(url, (get, hash) => {
        let name = get.callback;
        let delim = _.get([name, 'scope_delimiter'], this.oauth_misc) || ' ';
        let auth = {
          name: name,
          token: hash.access_token,
          scopes_have: get.scope.replace(/\+/g, ' ').split(delim),
        };
        this.auths[name] = auth;
        //localStorage.setItem(name, JSON.stringify(auth));
        setKV(name, auth);
      });

      load_ui = load_ui;
      // load_auth_ui = load_auth_ui;
      // load_fn_ui = load_fn_ui;
      // load_scrape_ui = load_scrape_ui;
      req_url = req_url;
      pick_fn = pick_fn;
      extract_url = extract_url;
      doCurl = doCurl;
  }
})

// @RouteConfig([
//   {path:'/test',          name: 'CrisisCenter', component: genClass({}, html) },
//   {path:'/hero/:id',      name: 'HeroDetail',   component: HeroDetailComponent},
//   {path: '/home', loader: () => Promise.resolve(MyLoadedCmp), name: 'MyLoadedCmp'}
// // (name, path) => System.import(path).then(c => c[name])      //<- given systemjs; does that do http? what of http.get(url)? then how to load the code?
// ])
//DynamicRouteConfigurator: http://blog.mgechev.com/2015/12/30/angular2-router-dynamic-route-config-definition-creation/
// <router-outlet></router-outlet>
// [child routes](https://angular.io/docs/ts/latest/guide/router.html#!#child-router), e.g. within non-root:
// <a [routerLink]="['./Product-one']">, <a [routerLink]="['/Home']">
// [aux routing](http://plnkr.co/edit/n0IZWh?p=preview): multiple router-outlets in one view, but still ["more trouble than it's worth"](https://github.com/angular/angular/issues/5027#issuecomment-169464546)
// programmatic navigation in two router-outlets with param passing: this._router.navigate(['/', ['EditEntity'], { id: id }]);
// ... note that I'm fuzzy on the details of how that works, i.e. which routes and params would go to which router-outlets.
