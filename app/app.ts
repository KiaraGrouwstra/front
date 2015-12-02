/// <reference path="../typings/tsd.d.ts" />

import 'reflect-metadata'
import {bootstrap, CORE_DIRECTIVES, FORM_DIRECTIVES, Component, View, ElementRef, Directive, Attribute, DynamicComponentLoader, Injectable, Injector, ChangeDetectorRef, ComponentMetadata, Observable} from 'angular2/angular2'
import {RouteConfig, Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router'
import {Http, Headers} from 'angular2/http'
import {IterableDiffers} from 'angular2/src/core/change_detection/differs/iterable_differs'

let providers = [ROUTER_PROVIDERS] //, IterableDiffers
let directives = [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES]  //adapter.upgradeNg1Component('ngMaterial')

import WS from './ws.ts'
//import { Subject, Observable, Subscriber, Subscription } from '@reactivex/rxjs'
var _ = require('lodash')
import Dummy from './dummy.ts'

//Materialize
global.$ = global.jQuery = require("jquery")
require("materialize-css/dist/js/materialize.min")

// //import {UpgradeAdapter} from 'angular2/upgrade'
//var adapter = new UpgradeAdapter()

/*
interface Observable {
  elemToArr: () => Observable;
  arrToArr: () => Observable;
  elemToSet: () => Observable;
  arrToSet: () => Observable;
  setToSet: () => Observable;
}

// append to array:
Observable.prototype.elemToArr = () => this.scan((arr, x) => { arr.push(x); return arr; }, [])
Observable.prototype.arrToArr = () => this.scan((a, b) => a.concat(b), [])
// append to Set:
Observable.prototype.elemToSet = () => this.scan((set, x) => set.add(x), new Set)
Observable.prototype.arrToSet = () => this.scan((set, arr) => arr.reduce((set, x) => set.add(x), set), new Set)
Observable.prototype.setToSet = () => this.scan((a, b) => new Set([...a, ...b]), new Set)   //ES6: Set(function*() { yield* a; yield* b; }())
*/

// append to array:
let elemToArr = (arr, x) => { arr.push(x); return arr; }
let arrToArr = (a, b) => a.concat(b)
// append to Set:
let elemToSet = (set, x) => set.add(x)
let arrToSet = (set, arr) => arr.reduce((set, x) => set.add(x), set)
let setToSet = (a, b) => new Set([...a, ...b])   //ES6: Set(function*() { yield* a; yield* b; }())

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
  deps: any
  ws: WS
  items: any

  constructor(dcl: DynamicComponentLoader, el_ref: ElementRef, inj: Injector) {
    this.deps = {dcl: dcl, el_ref: el_ref, inj: inj}
    this.ws = new WS()
    global.ws = this.ws
    //dcl.loadAsRoot(Dummy, "#foo", inj)
    let arr = [1,2,3]
    this.items = Observable.fromArray(arr)
      .scan(elemToArr, [])
      //.scan(elemToSet, new Set)
    //this.items = this.ws.out.elemToArr()
    //this.items = this.ws.out.scan(elemToArr, [])
  }

  // fetch a URL
  addUrl = (url) => {
    return this.ws.ask("/urls", {urls: url}) //, headers: []
  }

  // fetch a URL and extract its contents based on a json parselet, with a callback to insert it into the view.
  parsley = (url, parselet) => {
    let pars = {url: url, parselet: parselet}
    return this.ws.ask("/parse", pars)
    .subscribe(e => console.log("sub", e))
  }

  // given a curl command, try out different combinations of headers to see which work, putting results in a table.
  toCurl = (str: string) => {
    let found = str.match(/-H '([^']+)'/g)
    let url = /'[^']+(?=')/.exec(str)[0].substr(1)
    let headers = _.object(found.map(x =>
      /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
    ))
    return this.ws.ask("/check", {urls: url, headers: headers})
  }

  // insert a table component populated with an Observable
  makeTable = (rows: Observable<any>, to = 'table') => {
    let cols = rows.map(x => Object.keys(x)).scan(arrToSet, new Set)
    let pars = { rows: rows, cols: cols }
    this.loadHtmlTo(to, pars, require('./table.jade'))
  }

  // generate a component and place it at a given location (based on a template variable name)
  loadHtmlTo = (id: string, pars: {}, template: string, deps = []) => {
    let comp = this.genClass(pars, template)
    return this.deps.dcl.loadAsRoot(comp, "#"+id, this.deps.inj)
    //return this.deps.dcl.loadIntoLocation(comp, this.deps.el_ref, id, deps)
  }

  // dynamically generate a class using the given template and property values e.g. {a: foo, bar: val}
  genClass = (pars: {}, template: string) => {
    var comp: any = class {
      constructor(cdr: ChangeDetectorRef) {
        for (var k in pars) this[k] = pars[k]
        let update = () => { cdr.detectChanges() }
        setTimeout(update, 5000)
        // ^ ugly workaround to `loadAsRoot`: https://github.com/angular/angular/issues/3474
        // still causes an exception with observables too -_-;
      }
    }
    comp.parameters = [ChangeDetectorRef]
    comp.annotations = [new ComponentMetadata({
      selector: 'comp',  // no name clash?
      providers: providers,
      directives: directives,
      template: template
    })]
    return comp
  }

}

bootstrap(App, [WS]); // injected singletons

(function($){
  $(function(){
    $('.button-collapse').sideNav()
  })
})(global.$)
