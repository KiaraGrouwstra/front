// switch back to TypeScript as soon as I can figure out howto use imported libraries.
// until I do... basically don't change stuff to prevent resyncing.

/// <reference path="../typings/tsd.d.ts" />
// gulp && webpack --watch
// live-server --port=8090

import 'reflect-metadata';
// ng2 decorators/services
import {Directive, Component, View, ElementRef, Attribute, NgStyle, bootstrap} from 'angular2/angular2';
// import {RouteConfig, Router} from 'angular2/router';
// import {Http, Headers} from 'angular2/http';
// ng2 directives
// import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
// import {ROUTER_DIRECTIVES} from 'angular2/router';

// import WS from './websocket';
// import WS from './ws.ts';

@Component({
  selector: 'app'
})
@View({
  // directives: [ CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES ],
  styles: [ require('./style.less') ],
  template: require('./header.jade')
})
export class App {
  name: string;
  chan: any;  // Phoenix websocket channel
  //data: Array<any> = []; // default data
  //pass in variables to automate their declaration/assignment
  constructor() { //WS: WS
    this.name = 'Alice';
    // global.ws = new WS();
    // this.chan = WS.init();
  }
  // onInit() {}
  addUrl(url) {
    // this.urls.push(url);
    console.log(url);
    // chan.push("post:/urls", {user: "tycho", data: url})
  }
}

// bootstrap(App, [WS]);
bootstrap(App);
