// import 'reflect-metadata';
import { Component, ViewChild, ChangeDetectionStrategy, Inject, ViewEncapsulation } from 'angular2/core';
import { CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm } from 'angular2/common';
import { Router, ROUTER_DIRECTIVES, RouteConfig } from 'angular2/router'; //, RouteParams
import { Http } from 'angular2/http'; //Headers
// import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/mergeMap';
// import 'rxjs/add/operator/startWith';
// import 'rxjs/add/observable/from';
// import 'rxjs/add/observable/forkJoin';
// https://github.com/ReactiveX/RxJS/tree/master/src/add/operator
// global.Rx = require('rxjs');
// global.ng = require('angular2/core');
let _ = require('lodash/fp');
// let Immutable = require('immutable');
global.Immutable = require('immutable');
// import { autobind, mixin, decorate } from 'core-decorators';  // @decorate(_.memoize)
import { MarkedPipe } from '../../lib/pipes';
import { APP_CONFIG, Config } from '../../../config';
import { WsService } from '../../services/ws/ws';
import { RequestService } from '../../services/request/request';
import { handle_auth, toast, setKV, getKV, prettyPrint, ng2comp } from '../../lib/js.js';
import { load_ui, get_submit, req_url, pick_fn, extract_url, doCurl } from './ui';
import { ValueComp, FormComp, AuthUiComp, FnUiComp, InputUiComp } from '../../comps';
import { curl_spec } from './curl_spec';
import { scrape_spec } from './scrape_spec';

let directives = [CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm, ValueComp, AuthUiComp, FnUiComp, InputUiComp, FormComp];  // , ROUTER_DIRECTIVES
let pipes = [MarkedPipe];

export let App = ng2comp({
  component: {
    selector: 'app',
    //changeDetection: ChangeDetectionStrategy.CheckAlways,
    template: require('./app.jade'),
    directives, // one instance per component   //viewDirectives: private from ng-content
    pipes,
    // encapsulation: ViewEncapsulation.Native,
  },
  parameters: [
    Router,
    Http,
    RequestService,
    WsService,
    APP_CONFIG,
  ],
  decorators: {
    v: ViewChild(ValueComp),
    auth_ui: ViewChild(AuthUiComp),
    fn_ui: ViewChild(FnUiComp),
    input_ui: ViewChild(InputUiComp),
  },
  class: class App {
    // @ViewChild('web') web_form; //: ElementRef
    // @ViewChild('curl') curl_form; //: ElementRef
    auto_meat = true;
    keep_metadata = false;
    meat_opts = [];
    meat_str_opts = [];
    meat = [];
    auths = {};
    raw = { test: 'lol' };
    apis = ['instagram', 'github', 'ganalytics'];
    spec = {};
    path = ['test'];

    //routeParams: RouteParams, <-- for sub-components with router params: routeParams.get('id')
    constructor(
      router: Router,
      http: Http,
      req: RequestService,
      ws: WsService,
      config: Config,
    ) {
      this.router = router;
      this.http = http;
      this.req = req;
      this.ws = ws;
      this.config = config;
    }

    ngOnInit() {
      // $('select').material_select();
      this.ws.connected$.subscribe(y => y ? toast.success('websocket connected!') : toast.warn('websocket disconnected!'));
      global.app = this;
      let api = this.apis[0];
      this.apis.forEach(name => getKV(name).then((v) => {
        this.auths[name] = v;
        if(name == api) $('#scope-list .collapsible-header').click();
      }));

      this.curl = curl_spec;
      this.scrape_spec = scrape_spec;

      this.handle_implicit(window.location);
      this.load_ui(api);
    };

    get raw() {
      return this._raw;
    }
    set raw(x) {
      if(_.isUndefined(x)) return;
      this._raw = x;
      this.data = x;
    }
    addData(x) {
      this._raw = this._raw.concat(x);
      this.data = this.data.concat(_.get(this.meat)(x));
    }

    get data() {
      return this._data;
    }
    set data(x) {
      this._data = x;
      this.raw_str = JSON.stringify(x);
      this.colored = prettyPrint(x);
    }

    get spec() {
      return this._spec;
    }
    set spec(x) {
      if(_.isUndefined(x)) return;
      this._spec = x;
      this.spec_meat();
    }

    get meat() {
      return this._meat;
    }
    set meat(x) {
      if(_.isUndefined(x)) return;
      this._meat = x;
      if(this.raw) {
        this.data = [];
        this.raw.forEach(v => this.data.concat(_.get(x)(v)));
      }
      this.spec_meat();
    }

    spec_meat() {
      let spec_path = _.flatten(this.meat.map(str => ['properties', str]));
      this.zoomed_spec = _.get(spec_path)(this.spec);
    }

    // sets and saves the auth token + scopes from the given get/hash
    handle_implicit = (url) => handle_auth(url, (get, hash) => {
      let name = get.callback;
      let delim = _.get([name, 'scope_delimiter'], this.oauth_misc) || ' ';
      let auth = {
        name,
        token: hash.access_token,
        scopes_have: get.scope.replace(/\+/g, ' ').split(delim),
      };
      this.auths[name] = auth;
      //localStorage.setItem(name, JSON.stringify(auth));
      setKV(name, auth);
    });

    load_ui = load_ui;
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
// // (name, path) => System.import(path).then(y => y[name])      //<- given systemjs; does that do http? what of http.get(url)? then how to load the code?
// ])
//DynamicRouteConfigurator: http://blog.mgechev.com/2015/12/30/angular2-router-dynamic-route-config-definition-creation/
// <router-outlet></router-outlet>
// [child routes](https://angular.io/docs/ts/latest/guide/router.html) -> child-router, e.g. within non-root:
// <a [routerLink]="['./Product-one']">, <a [routerLink]="['/Home']">
// [aux routing](http://plnkr.co/edit/n0IZWh?p=preview): multiple router-outlets in one view, but still ["more trouble than it's worth"](https://github.com/angular/angular/issues/5027)
// programmatic navigation in two router-outlets with param passing: this._router.navigate(['/', ['EditEntity'], { id }]);
// ... note that I'm fuzzy on the details of how that works, i.e. which routes and params would go to which router-outlets.
