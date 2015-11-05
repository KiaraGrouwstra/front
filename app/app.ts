/// <reference path="../typings/tsd.d.ts" />
// gulp && webpack --watch
// live-server --port=8090

import 'reflect-metadata';
// ng2 decorators/services
import {Directive, Component, View, ElementRef, Attribute, NgStyle, NgFor, bootstrap} from 'angular2/angular2';
// import {RouteConfig, Router} from 'angular2/router';
// import {Http, Headers} from 'angular2/http';
// ng2 directives
// import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
// import {ROUTER_DIRECTIVES} from 'angular2/router';

import WS from './ws.ts';
var _ = require('lodash');

@Component({
  selector: 'app'
})
@View({
  directives: [ NgFor ], //, CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES
  styles: [ require('./style.less') ],
  template: require('./header.jade')
})
export class App {
  name: string;
  ws: WS;
  items: Array<any>;
  //data: Array<any> = []; // default data
  //pass in variables to automate their declaration/assignment
  constructor() {
    this.name = 'Alice';
    this.ws = new WS();
    // global.ws = this.ws;
    // this.items = [1, "foo", [1,2,3], {"foo": "bar"}];
    this.items = [];
  }
  addUrl(url) {
    // this.urls.push(url);
    this.ws.ask("POST", "/urls", url)
  }
  toCurl(str) {
    let found = str.match(/-H '([^']+)'/g);
    let url = /'[^']+(?=')/.exec(str)[0].substr(1);
    let headers = _.object(found.map(x =>
      /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
    ));
    console.log(url, headers);
    // this.ws.ask("POST", "/urls", url, headers)
    this.ws.ask_array(this.items, "POST", "/check", url, headers)
  }
}

bootstrap(App, [WS]);
