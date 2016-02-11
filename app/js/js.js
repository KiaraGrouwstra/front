let _ = require('lodash');
global.$ = global.jQuery = require("jquery");
require("materialize-css/dist/js/materialize.min");
// import { EventEmitter } from 'angular2/core';
// require('rxjs/Observable');
// import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/operator/combineLatest';
// let YAML = require('yamljs');

// let Array_last = function() {
//   return this[this.length-1];
// }
// Array.prototype.last = Array_last;

// deprecated: use ES7 Array.prototype.includes()
// let Array_has = function(k) {
//   return this.indexOf(k) >= 0;
// }
// Array.prototype.has = Array_has;

// ditch for _.compact()?
let Array_clean = function() {
  return this.filter((el, idx, arr) => el);
}
Array.prototype.clean = Array_clean;

//let truthy = (el, idx, arr) => el;
let Array_flatten = function() {
  return this.reduce((a, b) => a.concat(b), []);
}
Array.prototype.flatten = Array_flatten;
// ^ alt: _.flatten(arr, bool deep)

// create an element from an HTML string (for now with a single root element)
// let elFromHtml = (html) => {
//   try {
//     return jQuery(html).toArray()[0] || elFromText(html)
//   }
//   catch (e) {
//     return elFromText(html)
//   }
// }
// create an element from a text string (can also do some HTML but not dependent elements like td)
// let elFromText = (s) => {
//   let div = document.createElement('div');
//   div.innerHTML = s;
//   return div.firstChild;  //multiple: .childNodes
// }
// immutable `appendChild`
// Element.prototype.add = function(el) {
//   let tmp = this.cloneNode(true);
//   tmp.appendChild(el);
//   return tmp;
// }
//let cloneOf = o => JSON.parse(JSON.stringify(o));
// http://codereview.stackexchange.com/questions/84951/invert-a-javascript-object-hash-whose-values-are-arrays-to-produce-a-new-objec
// function arrayAwareInvert(o) {
//   let merge = (res, vals, k) => _.merge(res, _.mapValues(_.zipObject(vals), (v) => k))
//   return _.reduce(o, merge, {});
// }
// Object.filter
let Object_filter = (obj, pred) => arr2obj(Object.keys(obj).filter(k => pred(obj[k])), k => obj[k])
// Element.prototype.child = function(i) {
//   return this.children.item(i)
// }
// Element.prototype.appendChildren = function(html_coll) {
//   while(html_coll.length > 0) {
//     this.appendChild(html_coll.item(0))
//   }
//   return this;
// }
let RegExp_escape = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

let arr2obj = (arr, fn) => _.zipObject(arr, arr.map(fn));

let do_return = (fn) => (v) => {
  fn(v);
  return v;
}
let Prom_do = function(fn1, fn2 = (e) => console.log(e)) {
  return this.then(do_return(fn1), do_return(fn2));
}
Promise.prototype.do = Prom_do;

let Prom_finally = function(fn) {
  return this.do(fn, fn);
}
Promise.prototype.finally = Prom_finally;

let Prom_toast = function(msg) {
  // return this.do(_v => toast.success(msg), e => toast.error(e));
  return this.then(do_return(_v => toast.success(msg)), do_return(e => toast.error(e)));
}
Promise.prototype.toast_result = Prom_toast;

// let onNext = (x) => console.log('Next: ' + x);
// let onErr = (err) => console.log('Error: ' + err);
// let onComp = () => console.log('Completed');
// (a = onNext, b = onErr, c = onComp)
// let noop = () => {};
// (a = noop, b = noop, c = noop)
// let Obs_do = Observable.prototype.do = function(onNext, onErr, onComp) {
// Observable.prototype.do = function(onNext, onErr, onComp) {
//   this.subscribe(onNext, onErr, onComp);
//   return this;
// }
// let Obs_do = Observable.prototype.do;
// // let Obs_then = Observable.prototype.then = function(fn) {
// Observable.prototype.then = function(fn) {
//   return this.do(null, null, fn);
// }
// let Obs_then = Observable.prototype.then;

let handle_auth = (url, fn) => {
  let url_bit = (url, part) => {
    let par_str = url[part].substring(1);
    let params = decodeURIComponent(par_str).split('&');
    return arr2obj(params, s => s.split('='));
  }
  let url_get_hash = (url) => ['search', 'hash'].map(x => url_bit(url, x))
  let [get, hash] = url_get_hash(url)
  // console.log('get', get)
  // console.log('hash', hash)
  if(get.callback) {
    // this.routeParams.get(foo): only available in router-instantiated components.
    fn(get, hash)
  } else {
    // ?: error=access_denied&error_reason=user_denied&error_description=The+user+denied+your+request
    if(get.error) console.log(get)
  }
}

let popup = (popup_url, watch_url) => new Promise((resolve, reject) => {
  let win = window.open(popup_url);
  let pollTimer = window.setInterval(() => {
    if(win.location.pathname) {
      let url = win.location.href;
      if (url.indexOf(watch_url) != -1) {
        window.clearInterval(pollTimer);
        resolve(win.location);
        win.close();
      }
    } else {
      window.clearInterval(pollTimer);
      reject('tab closed');
    }
  }, 100);
}).toast_result(`got auth result!`);

let toasts = {
  debug: { val: 0, class: 'grey' },
  info: { val: 1, class: 'blue' },
  success: { val: 2, class: 'green' },
  warn: { val: 3, class: 'orange' },
  error: { val: 4, class: 'red' },
};
let TOAST_LEVEL = toasts.success.val;
let LOG_LEVEL = toasts.info.val;
let toast = arr2obj(Object.keys(toasts), (kind) => (msg, ms = 1000) => {
  let level = toasts[kind].val;
  if(level >= TOAST_LEVEL) Materialize.toast(msg, ms, toasts[kind].class);
  if(level >= LOG_LEVEL) console.log(`${kind}:`, msg);
});

let setKV = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let getKV = (k) => new Promise((resolve, reject) => {
  let saved = localStorage.getItem(k);
  if(saved != null) {
    resolve(JSON.parse(saved));
  } else {
    reject(`key ${k} not found`);
  }
}).toast_result(`loaded data for ${k}!`);

let range = (n) => Array(n).fill().map((x,i)=>i);
let spawn_n = (fn, n = 5, interval = 1000) => range(n).forEach((x) => setTimeout(fn, x * interval));
// let yaml2json = _.flow(YAML.parse, JSON.stringify);
// let yaml2json = (yml) => JSON.stringify(YAML.parse(yml));
let mapBoth = (obj, fn) => {
  let keys = Object.keys(obj)
  return _.zipObject(keys, keys.map(k => fn(obj[k], k)));
}

let String_stripOuter = function() {
  return this.replace(/^\s*<\w+>(.*)<\/\w+>\s*$/, '$1');
  // console.log('before', this);
  // let rep = this.replace(/^\s*<\w+>(.*)<\/\w+>\s*$/, '$1');
  // console.log('after', rep);
  // return rep;
}
String.prototype.stripOuter = String_stripOuter;

// pretty print a json object
let prettyPrint = (o) => {
  let replacer = (match, r = '', pKey, pVal, pEnd = '') => r +
    ((pKey) ? `<span class=json-key>${pKey.replace(/[": ]/g, '')}</span>: ` : '') +
    ((pVal) ? `<span class=${pVal[0] == '"' ? 'json-string' : 'json-value'}>${pVal}</span>` : '') + pEnd;
  return JSON.stringify(o, null, 3)
  .replace(/&/g, '&amp;')
  .replace(/\\"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg, replacer);
}

// return different path properties
let getPaths = (path) => {
  let k = path.slice(-1)[0]; //.last()
  let id = path.join('-');  // /^[a-zA-Z][\w:.-]*$/
  // let model = path.join('.');
  let elvis = path.join('?.');  //ng2 elvis operator to prevent crashing if some element is missing
  let variable = id.replace(/-/g, '_')
  return {k: k, id: id, model: elvis, variable: variable}
}

// cleanse a string to use as an ID
let id_cleanse = (s) => s.replace(/[^\w]+/g, '-').replace(/(^-)|(-$)/g, '');

// asynchronously create and test a component
let comp_test = (test_class, actions, test_fn) => {
  return (tcb) => new Promise((pass, fail) => {
    // let tc = await tcb.createAsync(test_class);
    return tcb.createAsync(test_class)
    .then((tc) => {
      try {
        tc.detectChanges();
        let test_comp = tc.componentInstance;
        let target_comp = test_comp.comp;
        actions(test_comp); //target_comp?
        //test_comp.items.push(3);
        // https://angular.io/docs/ts/latest/api/testing/ComponentFixture-class.html
        // https://angular.io/docs/ts/latest/api/testing/NgMatchers-interface.html
        tc.detectChanges();
        test_fn(target_comp, pass);
      }
      catch(e) {
        fail(e);
      }
    })
  })
}

// test_fn for comp_test to check a property value
let assert = (assertion) => (comp, pass) => {
  assertion(comp);
  pass();
}

// test_fn for comp_test to check an Observable property's first value
let assert$ = (selector, matcher) => (comp, pass) => {
  selector(comp).subscribe(prop => {
    matcher(expect(prop));
    pass();
  })
}

export { Array_clean, Array_flatten, Object_filter, RegExp_escape, handle_auth, popup, toast, setKV, getKV, Prom_do, Prom_finally, Prom_toast, spawn_n, arr2obj, mapBoth, do_return, String_stripOuter, prettyPrint, getPaths, id_cleanse, comp_test, assert, assert$ };  //, Obs_do, Obs_then
