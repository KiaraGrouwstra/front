// /// <reference path="../typings/tsd.d.ts" />

import 'reflect-metadata';
import { Component, View, ElementRef, Directive, Attribute, Injectable, Injector, Pipe, OnInit, EventEmitter,
    DynamicComponentLoader, ChangeDetectorRef, ComponentMetadata, ChangeDetectionStrategy } from 'angular2/core';  //, Observable
import { CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm, FormBuilder, Control, Validators } from 'angular2/common';
import { Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteParams } from 'angular2/router';
import { HTTP_BINDINGS, Http } from 'angular2/http'; //Http, Headers
import { IterableDiffers } from 'angular2/src/core/change_detection/differs/iterable_differs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromArray';
import 'rxjs/add/observable/from';
//import 'rxjs/add/observable/interval';
// https://github.com/ReactiveX/RxJS/tree/master/src/add/operator
// difference with this? https://github.com/ReactiveX/RxJS/tree/master/src/operator
// https://github.com/ReactiveX/RxJS
global.Observable = Observable;
import { MarkedPipe } from './pipes';
import WS from './ws';
let _ = require('lodash');
// import Dummy from './dummy';
import { elemToArr, arrToArr, elemToSet, arrToSet, setToSet, loggers, notify } from './rx_helpers';
import { Object_filter, Array_has, handle_auth, popup, toast, setKV, getKV, Prom_do, Prom_finally, spawn_n, arr2obj, do_return, RegExp_escape, String_stripOuter, prettyPrint } from './js.js';
import { parseVal, method_form, get_submit } from './parser';
let marked = require('marked');
import { gen_comp, form_comp } from './dynamic_class';
let Immutable = require('immutable');
String.prototype.stripOuter = String_stripOuter;
// import { ColoredComp } from './colored';

let directives = [CORE_DIRECTIVES, FORM_DIRECTIVES, NgForm];  //, ROUTER_DIRECTIVES //, ColoredComp
let pipes = [MarkedPipe];

Promise.prototype.finally = Prom_finally;
Promise.prototype.do = Prom_do;
Array.prototype.has = Array_has;

@Component({
  selector: 'app',
  //changeDetection: ChangeDetectionStrategy.CheckAlways,
})
@View({
  template: require('../jade/ng-output/materialize.jade'),
  directives: directives, // one instance per component
  pipes: pipes,
})
export class App {
  deps: any;
  ws: WS;
  items: any;
  rows: any;
  cols: any;
  auths: {};
  json: Observable<string>;
  colored: Observable<string>;
  auth: any;
  functions: any;
  inputs: any;
  apis: Array<string>;
  oauth_misc: {};

  constructor(dcl: DynamicComponentLoader, //router:Router, routeParams: RouteParams,
        el_ref: ElementRef, inj: Injector, cdr: ChangeDetectorRef, http: Http) {
    this.deps = { dcl: dcl, el_ref: el_ref, inj: inj, cdr: cdr, http: http };
    this.ws = new WS("ws://127.0.0.1:8080/socket", "rooms:lobby", () => toast.success('websocket connected!'), () => toast.warn('websocket disconnected!'));
    global.ws = this.ws;
    global.app = this;
    this.auths = {};
    this.json = new EventEmitter();
    setTimeout(() => 
        this.json.emit('{"test":"lol"}')
    , 1000)
    this.colored = this.json.map(x => prettyPrint(x));
    global.Control = Control;
    //let pollTimer = window.setInterval(this.refresh, 500);
    //dcl.loadAsRoot(Dummy, "#foo", inj);
    this.apis = ['instagram', 'github'];
    this.apis.forEach(name => getKV(name).then((v) => this.auths[name] = v));

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

    this.load_ui(this.apis[0]);

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

  load_ui = (name) => {
    let pars = this.deps.http
      .get(`./swagger/${name}.json`)
      .map(x => JSON.parse(x._body));
    //pars.subscribe(_ => this.loadHtml('swagger', _, require('../jade/ng-output/swagger.jade')));
    //notify(pars, "pars");
    //this.loadHtml('swagger', pars, require('../jade/ng-output/swagger.jade'));

    let $RefParser = require('json-schema-ref-parser');
    let swag = this.deps.http
    .get('./swagger/swagger.json')
    .map(x => x._body)
    .map(x => {
      let esc = RegExp_escape("http://json-schema.org/draft-04/schema");
      return x.replace(new RegExp(esc, 'g'), "/swagger/schema.json");
    })
    .map(x => JSON.parse(x))
    .subscribe(x => {
      $RefParser.dereference(x).then((schema) => {
        //pars.subscribe(api => this.loadHtml('test', api, html));
        pars.subscribe(api => {

          let sec_defs = api.securityDefinitions;
          let oauth_sec = _.find(Object.keys(sec_defs), (k) => sec_defs[k].type == 'oauth2');
          let oauth_info = sec_defs[oauth_sec];
          let scopes = Object.keys(oauth_info.scopes);
          // auth form
          this.load_auth_ui(name, scopes, oauth_info).then(x => {
            this.auth = x;

            // function list
            this.load_fn_ui(name, scopes, api, oauth_sec).then(x => {
              this.functions = x;
              this.refresh();
              global.$('.collapsible#fn-list')['collapsible']();
              spawn_n(() => {
                global.$('.tooltipped')['tooltip']({delay: 0});
              }, 3);
            });
            // ^ why doesn't ngOnInit trigger in my generated class?
            //spawn_n(() => this.refresh(), 30);
          });

          // output
          /*
          $RefParser.dereference(api).then((api_full) => {
            let html = parseVal([], api_full, schema);
            this.loadHtml('output', {}, html);
          });
          */

        });
      })
    })
  }

  load_auth_ui = (name, scopes, oauth_info) => {
    let auth = require('../jade/ng-input/auth.jade');
    let onSubmit = function() {
    let scope = this.scopes_arr.filter(s => this.want_scope[s]).join(_.get(this.oauth_misc[name], ['scope_delimiter'], ' '));
    //let redirect_uri = `http://127.0.0.1:8090/callback/${name}/?` + global.$.param({scope: scope});
    let redirect_uri = `http://127.0.0.1:8090/?` + global.$.param({scope: scope, callback: name});
    let url = oauth_info.authorizationUrl + '?' + global.$.param({
        scope: scope,
        //state: 'abc',
        response_type: 'token',
        redirect_uri: redirect_uri,
        client_id: 'a974ee2962104288a9915d20e76dec5c',
    });
    this.loading = true;
    popup(url, redirect_uri)
        .then((loc) => this.parent.handle_implicit(loc))
        .finally(v => this.loading = false);
    };
    let auth_pars = {
    parent: this,
    scopes_arr: scopes,
    want_scope: arr2obj(scopes, s => true),  //uncheck: follower_list, public_content
    have_scope: arr2obj(scopes, s => _.get(this, ['auths',name,'scopes_have'], []).has(s)),
    scope_descs: oauth_info.scopes,
    onSubmit: onSubmit,
    loading: false,
    }
    // console.log('loading auths')
    return this.loadHtml('auth', auth_pars, auth);
  }

  load_fn_ui = (name, scopes, api, oauth_sec) => {
    let tags = api.tags;
    let tag_paths;
    let misc_key;
    if(tags) {
        misc_key = 'misc';
        tag_paths = Object.assign(arr2obj(tags.map(x => x.name), tag =>
            Object.keys(api.paths).filter(path => _.get(api.paths[path], ['get', 'tags'], []).has(tag))
          ), _.object([[misc_key, Object.keys(api.paths).filter(path => ! _.get(api.paths[path], ['get', 'tags'], []).length ) ]])
        );
    } else {
        api.tags = [];
        misc_key = 'functions';
        tag_paths = _.object([[misc_key, Object.keys(api.paths)]])
    }
    api.tags.push({ name: misc_key });
    // console.log('api.tags', api.tags);
    // console.log('api', api);
    // todo: add untagged functions
    let path_scopes = _.mapValues(api.paths, path => {
        let secs = _.get(path, ['get', 'security'], []);
        let scopes = _.find(secs, sec => _.has(sec, oauth_sec));
        return scopes ? scopes[oauth_sec] : [];
    });
    let descs = _.mapValues(api.paths, path =>
        marked(_.get(path, ['get', 'description'], '')) //.stripOuter()
    );
    let have_scopes = _.mapValues(path_scopes, (scopes) => _.every(scopes, s => this.auth.have_scope[s]));
    let path_tooltips = _.mapValues(path_scopes, (scopes) => `required scopes: ${scopes.join(', ')}`);
    let has_usable = _.mapValues(tag_paths, (paths) => _.some(paths, p => have_scopes[p]));
    let fn_pars = Object.assign({}, api, {
        parent: this,
        paths: api.paths,
        descs: descs,
        tag_paths: tag_paths,
        path_scopes: path_scopes,
        have_scopes: have_scopes,
        path_tooltips: path_tooltips,
        has_usable: has_usable,
        load_form: (fn_path) => {
          // input form
          let { html: html, obj: params } = method_form(api, fn_path);
          // console.log('passing auth', this.auths[name]);
          let onSubmit = get_submit(api, fn_path, () => this.auths[name].token, x => {
              //this.json = x;
              this.json.emit(x);
              this.refresh();
          });
          let inp_pars = { parent: this, onSubmit: onSubmit, params: params };
          //console.log('input html', html)
          //console.log('inp_pars', inp_pars)
          // console.log('loading input')
          this.loadHtml('input', inp_pars, html, form_comp).then(x => this.inputs = x);
        },
    });
    // init: $('.collapsible')['collapsible']()
    let fn_view = require('../jade/ng-output/functions.jade');
    // console.log('loading functions')
    // console.log('fn_view', fn_view)
    // console.log('fn_pars', fn_pars)
    return this.loadHtml('functions', fn_pars, fn_view).then(
        () => setTimeout(
          () => global.$('#fn-list .collapsible-header').eq(0).click()
        , 1000)
    );
  }

}
