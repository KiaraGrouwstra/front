// import 'reflect-metadata';
import { Component, ViewChild, ChangeDetectionStrategy, Inject, ViewEncapsulation } from '@angular/core';
import { CORE_DIRECTIVES, NgForm } from '@angular/common';
import { FORM_DIRECTIVES } from '@angular/forms';
import { Router, ROUTER_DIRECTIVES } from '@angular/router';
import { Http } from '@angular/http'; //Headers
// import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/mergeMap';
// import 'rxjs/add/operator/startWith';
// import 'rxjs/add/observable/from';
// import 'rxjs/add/observable/forkJoin';
// https://github.com/ReactiveX/RxJS/tree/master/src/add/operator
// global.Rx = require('rxjs');
// global.ng = require('@angular/core');
let _ = require('lodash/fp');
// let Immutable = require('immutable');
// global.Immutable = require('immutable');
// import { autobind, mixin, decorate } from 'core-decorators';  // @decorate(_.memoize)
import { MarkedPipe } from '../../lib/pipes';
import { APP_CONFIG } from '../../../config';
import { WsService, RequestService, GlobalsService, FetcherService } from '../../services';
import { handleAuth, toast, setKV, getKV, prettyPrint, inputSchemas, getSafe } from '../../lib/js';
import { loadUi, get_submit, reqUrl, pickFn, doFetch, doProcess, doCurl } from './ui';
import { ValueComp, FormComp, AuthUiComp, FnUiComp, InputUiComp } from '../..';
import { curl_spec } from './curl_spec';
import { fetch_spec, process_spec } from './scrape_spec';
import { getSchema } from '../../lib/schema';
import { validate } from '../../slim/input/validators';

let directives = [CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm, ValueComp, AuthUiComp, FnUiComp, InputUiComp, FormComp];  // , ROUTER_DIRECTIVES
let pipes = [MarkedPipe];

@Component({
  selector: 'app',
  //changeDetection: ChangeDetectionStrategy.CheckAlways,
  template: require('./app.jade'),
  directives, // one instance per component   //viewDirectives: private from ng-content
  pipes,
  // encapsulation: ViewEncapsulation.Native,
})
export class App {
  @ViewChild(ValueComp) v: ValueComp;
  @ViewChild(AuthUiComp) auth_ui: AuthUiComp;
  @ViewChild(FnUiComp) fn_ui: FnUiComp;
  @ViewChild(InputUiComp) input_ui: InputUiComp;
  @ViewChild('curl_form') curl_form: FormComp;
  @ViewChild('fetch_form') fetch_form: FormComp;
  @ViewChild('process_form') process_form: FormComp;
  // @ViewChild('web') web_form; //: ElementRef
  // @ViewChild('curl') curl_form; //: ElementRef
  auto_meat = true;
  keep_metadata = false;
  meat_opts = [];
  meat_str_opts = [];
  _meat: string[];
  meat = [];
  auths = {};
  _data: Front.Data[];
  _extracted: Front.Data[];
  _raw: Front.Data[];
  // raw = { test: 'lol' };
  raw = [{ test: 'lol' }];
  // ^ ObjectComp is nicer for screen space with 1 item than TableComp, but
  // allowing to store single items without the array causes ambiguity on whether
  // an array here would be there for that or as part of a wrapper-less data item...
  apis = ['instagram', 'github', 'ganalytics'];
  // _spec: Front.ApiSpec;
  spec: Front.ApiSpec = {};
  _schema: Front.Schema;
  schema: Front.Schema; // = { type: 'object', additionalProperties: false };
  // _path: Front.Path;
  // path = ['test'];
  curl: Front.Schema;
  fetch_spec: Front.Schema;
  process_spec: Front.Schema;
  raw_str: string;
  colored: string;
  zoomed_schema: Front.Schema;
  extractor: Function;
  allowCors: boolean = false; // cannot await promise here

  constructor(
    // public router: Router,
    private _http: Http,
    private _back_fetcher: RequestService,
    private _ws: WsService,
    @Inject(APP_CONFIG) private _config: Front.Config,
    public g: GlobalsService,
    private _front_fetcher: FetcherService,
    // private _routeParams: RouteParams, <-- for sub-components with router params: routeParams.get('id')
  ) {
    new Promise((resolve, reject) =>
      fetch('http://localhost/').then(resolve).catch(reject))
      .then(v => { this.allowCors = true; });
  }

  get fetcher() {
    return this.allowCors ? this._front_fetcher : this._back_fetcher;
  }

  ngOnInit() {
    // $('select').material_select();
    // disable/hide if this.allowCors?
    this._ws.connected$.subscribe(y => y ?
        toast.success('websocket connected!') :
        toast.warn('websocket disconnected!'));
    global.app = this;
    let api = this.apis[0];
    this.apis.forEach(name => {
      getKV(name)
      .do((v) => {
        toast.success(`loaded data for ${name}!`);
        this.auths[name] = v;
        if(name == api) $('#scope-list .collapsible-header').click();
      })
      .catch(() => {
        toast.error(`key ${name} not found`);
      })
    });

    this.curl = curl_spec;
    this.fetch_spec = fetch_spec;
    this.process_spec = process_spec;

    this.handleImplicit(window.location);
    this.loadUi(api);
  };

  get extractor(): Function {
    let x = this._extractor;
    if(_.isUndefined(x)) x = this._extractor = y => y;
    return x;
  }
  set extractor(x: Function) {
    this._extractor = x;
    this.calcDerived();
  }

  calcDerived() {
    this.setExtracted();
    this.assertSchema(this.extracted);
    this.setData();
  }

  assertSchema(v: any) {
    if(!validate(v, this.schema)) {
      console.warn('value ', v, ' does not match schema ', this.schema, ', inferring valid schema!');
      this.meat = [];
      this.schema = getSchema(v);
    }
  }

  get raw(): Front.Data[] {
    return this._raw;
  }
  set raw(x: Front.Data) {
    if(_.isUndefined(x)) return;
    this._raw = x;
    // this.data = x;
    this.calcDerived();
  }

  addData(x: Front.Data): void {
    this._raw = this._raw.concat(x);
    let extracted = this.extractor(x);
    this.extracted = this.extracted.concat(extracted);
    let zoomed = getSafe(this.meat)(extracted);
    this.data = this.data.concat(zoomed);
  }

  get extracted(): Front.Data[] {
    if(_.isUndefined(this._extracted)) this.setExtracted();
    return this._extracted;
  }
  set extracted(x: Front.Data) {
    this._extracted = x;
  }

  setExtracted() {
    let extractor = this.extractor;
    let raw = this.raw;
    if(raw) {
      // this.extracted = raw.map(extractor);
      this.extracted = _.isArray(raw) ? raw.map(extractor) : extractor(raw);
    }
  }

  get data(): Front.Data[] {
    if(_.isUndefined(this._data)) this.setData();
    return this._data;
  }
  set data(x: Front.Data) {
    this._data = x;
    this.raw_str = JSON.stringify(x);
    this.colored = prettyPrint(x);
  }

  setData() {
    let extracted = this.extracted;
    if(extracted) {
      let fn = getSafe(this.meat);
      // this.data = extracted.map(fn);
      // this.data = _.isArray(extracted) ? extracted.map(fn) : fn(extracted);
      let v = _.isArray(extracted) ? extracted.map(fn) : fn(extracted);
      this.data = v;
    }
  }

  get schema(): Front.Schema {
    return this._schema;
  }
  set schema(x: Front.Schema) {
    if(_.isUndefined(x)) return;
    this._schema = x;
    this.schemaMeat();
  }

  get meat(): string[] {
    return this._meat;
  }
  set meat(x: string[]) {
    if(_.isUndefined(x)) return;
    this._meat = x;
    this.schemaMeat();
    this.setData();
  }

  schemaMeat(): Front.Schema {
    let path = _.flatten(this.meat.map(str => ['properties', str]));
    this.zoomed_schema = getSafe(path)(this.schema);
  }

  // sets and saves the auth token + scopes from the given get/hash
  handleImplicit = (url: string) => handleAuth(url, (get: string, hash: string) => {
    let name = get.callback;
    let auth = {
      name,
      token: hash.access_token,
      scopes_have: get.scope.replace(/\+/g, ' ').split(' '),
    };
    this.auths[name] = auth;
    //localStorage.setItem(name, JSON.stringify(auth));
    setKV(name, auth);
  });

  loadUi = loadUi;
  reqUrl = reqUrl;
  pickFn = pickFn;
  doFetch = doFetch;
  doProcess = doProcess;
  doCurl = doCurl;
}

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
