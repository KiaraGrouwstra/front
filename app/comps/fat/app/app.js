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
import WS from '../../services/ws/ws';
import { handle_auth, toast, setKV, getKV, prettyPrint, ng2comp, input_specs } from '../../lib/js.js';
import { load_ui, get_submit, req_url, pick_fn, extract_url, doCurl } from './ui';
import { ValueComp, FormComp, AuthUiComp, FnUiComp, InputUiComp } from '../../comps';

let directives = [CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm, ValueComp, AuthUiComp, FnUiComp, InputUiComp, FormComp];  // , ROUTER_DIRECTIVES
let pipes = [MarkedPipe];

export let App = ng2comp({
  component: {
    selector: 'app',
    //changeDetection: ChangeDetectionStrategy.CheckAlways,
    template: require('./app.jade'),
    directives: directives, // one instance per component   //viewDirectives: private from ng-content
    pipes: pipes,
    // encapsulation: ViewEncapsulation.Native,
  },
  parameters: [ Router, Http ],
  decorators: {
    v: ViewChild(ValueComp),
    auth_ui: ViewChild(AuthUiComp),
    fn_ui: ViewChild(FnUiComp),
    input_ui: ViewChild(InputUiComp),
  },
  class: class App {
      //routeParams: RouteParams, <-- for sub-components with router params: routeParams.get('id')
      constructor(router, http) {
        this.deps = { router: router, http: http };

        // sets and saves the auth token + scopes from the given get/hash
        this.handle_implicit = (url) => handle_auth(url, (get, hash) => {
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

        this.load_ui = load_ui;
        this.req_url = req_url;
        this.pick_fn = pick_fn;
        this.extract_url = extract_url;
        this.doCurl = doCurl;
      }

      ngOnInit() {
        //this.ws = new WS(url = "ws://127.0.0.1:8080/socket", chan_name = "rooms:lobby", () => toast.success('websocket connected!'), () => toast.warn('websocket disconnected!'));
        //this.ws = new WS({ onOpen: () => toast.success('websocket connected!'), onClose: () => toast.warn('websocket disconnected!') });
        this.ws = new WS('ws://127.0.0.1:8080/socket', 'rooms:lobby', () => toast.success('websocket connected!'), () => toast.warn('websocket disconnected!'));
        // global.ws = this.ws;
        global.app = this;
        this.auths = {};
        this.data = {test: 'lol' };
        this.apis = ['instagram', 'github', 'ganalytics'];
        let api = this.apis[0];
        this.apis.forEach(name => getKV(name).then((v) => {
          this.auths[name] = v;
          if(name == api) $('#scope-list .collapsible-header').click();
        }));
        this.spec = {};
        this.path = ['test'];
        this.fn_ui_oauth_sec = 'instagram_auth';

        // testing alt. approach of that used in scrape_ui
        let curl_spec = [{
        	name: 'curl',
        	type: 'string',
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

        // https://github.com/simov/grant/blob/master/config/oauth.json
        this.oauth_misc = require('../../../vendor/oauth.json');
        //authorize_url, access_url, oauth, scope_delimiter
        // other crap: https://grant-oauth.herokuapp.com/providers

        this.handle_implicit(window.location);
        this.load_ui(api);
      };

      get data() { return this._data; }
      set data(x) {
        this._data = x;
        this.raw = JSON.stringify(x);
        this.colored = prettyPrint(x);
      }
  }
})

// @RouteConfig([
//   {path:'/test',          name: 'CrisisCenter', component: genClass({}, html) },
//   {path:'/hero/:id',      name: 'HeroDetail',   component: HeroDetailComponent},
//   {path: '/home', loader: () => Promise.resolve(MyLoadedCmp), name: 'MyLoadedCmp'}
// // (name, path) => System.import(path).then(λ[name])      //<- given systemjs; does that do http? what of http.get(url)? then how to load the code?
// ])
//DynamicRouteConfigurator: http://blog.mgechev.com/2015/12/30/angular2-router-dynamic-route-config-definition-creation/
// <router-outlet></router-outlet>
// [child routes](https://angular.io/docs/ts/latest/guide/router.html) -> child-router, e.g. within non-root:
// <a [routerLink]="['./Product-one']">, <a [routerLink]="['/Home']">
// [aux routing](http://plnkr.co/edit/n0IZWh?p=preview): multiple router-outlets in one view, but still ["more trouble than it's worth"](https://github.com/angular/angular/issues/5027)
// programmatic navigation in two router-outlets with param passing: this._router.navigate(['/', ['EditEntity'], { id: id }]);
// ... note that I'm fuzzy on the details of how that works, i.e. which routes and params would go to which router-outlets.
