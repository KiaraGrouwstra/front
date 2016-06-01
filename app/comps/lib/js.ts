let _ = require('lodash/fp');
let $ = require('jquery');
let ng = require('@angular/core');
let marked = require('marked');
import { ComponentMetadata } from '@angular/core';
import { Maybe } from 'ramda-fantasy';

require('materialize-css/dist/js/materialize.min');
// let YAML = require('yamljs');

// export let RegExp_escape = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
// obsolete: use _.escapeRegExp

// _.mixin?
export function arr2obj<T>(arr: string[], fn: (string) => T): {[key: string]: T} {
  return _.zipObject(arr, arr.map(fn));
}
// let arr2obj = (arr, fn) => _.fromPairs(arr.map(k => [k, fn(k)]));

export function arr2map<T,U>(arr: Array<T>, fn: (T) => U): Map<T,U> {
  return arr.reduce((map, k) => map.set(k, fn(k)), new Map());
}

export function doReturn<T>(fn: (T) => void): (v: T) => T {
  return (v) => {
    fn(v);
    return v;
  };
}

export function promToast(msg: string): Promise {
  // return this.do(_v => toast.success(msg), e => toast.error(e));
  return this.then(doReturn(_v => toast.success(msg)), doReturn(e => toast.error(e)));
};
Promise.prototype.toastResult = promToast;

function urlBit(url: Location, part: string): Object {
  let par_str = url[part].substring(1);
  let params = decodeURIComponent(par_str).split('&');
  return _.fromPairs(params.map(y => y.split('=')));
}

export function handleAuth(url: Location, fn: (get: string, hash: string) => void): void {
  let urlGetHash = (url: Location) => ['search', 'hash'].map(x => urlBit(url, x));
  let [get, hash] = urlGetHash(url);
  if(get.callback) {
    // this.routeParams.get(foo): only available in router-instantiated components.
    fn(get, hash);
  } else {
    // ?: error=access_denied&error_reason=user_denied&error_description=The+user+denied+your+request
    if(get.error) console.warn(get);
  }
};

export function popup(popup_url: string, watch_url: string): Promise {
  return new Promise((resolve, reject) => {
    let win = window.open(popup_url);
    let pollTimer = window.setInterval(() => {
      try {
        if(win.location.pathname) {
          let url = win.location.href;
          if (url.includes(watch_url)) {
            window.clearInterval(pollTimer);
            resolve(win.location);
            win.close();
          }
        } else {
          window.clearInterval(pollTimer);
          reject('tab closed');
        }
      } catch(e) {
        // DOMException: Blocked a frame with origin [...] from accessing a cross-origin frame
      }
    }, 100);
  }).toastResult(`got auth result!`);
}

const toasts: Front.ILogLevels<{ val: number, class: string, icon: string }> = {
  debug: { val: 0, class: 'grey', icon: require('../../images/debug.png'), logger: 'debug' },
  info: { val: 1, class: 'blue', icon: require('../../images/info.png'), logger: 'info' },
  success: { val: 2, class: 'green', icon: require('../../images/success.png'), logger: 'log' },
  warn: { val: 3, class: 'orange', icon: require('../../images/warn.png'), logger: 'warn' },
  error: { val: 4, class: 'red', icon: require('../../images/error.png'), logger: 'error' },
};
const TOAST_LEVEL = toasts.success.val;
const LOG_LEVEL = toasts.info.val;

// somehow the native Notification API slows down my app a bunch (make table), why?
// ditch `ms` param if ditching Materialize in favor of Notification API.
// { icon?: string, body?: string, lang, tag, data, vibrate, renotify, silent, sound, noscreen, sticky }
// https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
export let toast: Front.ILogLevels<(msg: string, opts: Notification.options, ms?: number) => Notification> =
  arr2obj(_.keys(toasts), (kind: string) => (msg: string, opts: Notification.options = {}, ms: number = 1000) => {
    let { val: level, class: color, icon, logger } = toasts[kind];
    if(level >= LOG_LEVEL) console[logger](`${kind}:`, msg);
    if(level >= TOAST_LEVEL) {
      Materialize.toast(msg, ms, color);
      // let merged_opts = Object.assign({
      //   // body: kind,
      //   icon,
      // }, opts);
      // let n = new Notification(msg, merged_opts);
      // return n;
    }
});

export function setKV(k: string, v: any): void {
  localStorage.setItem(k, JSON.stringify(v));
}

export function getKV(k: string): Maybe<any> {
  let data = localStorage.getItem(k);
  return Maybe(data).map(x => JSON.parse(x));
}

// let range = (n) => Array(n).fill().map((x,i)=>i);
// let spawn_n = (fn, n = 5, interval = 1000) => range(n).forEach((x) => setTimeout(fn, x * interval));
// let yaml2json = _.flow(YAML.parse, JSON.stringify);
// let yaml2json = (yml) => JSON.stringify(YAML.parse(yml));
export function mapBoth<T,U>(obj: {[key: string]: T}, fn: (T) => U): {[key: string]: U} {
  let keys = _.keys(obj);
  // return _.zipObject(keys, keys.map(k => fn(obj[k], k)));
  return arr2obj(keys, k => fn(obj[k], k));
}
// _.mapValues.convert({ 'cap': false })
// ^ I could ditch this mapBoth crap for Lodash/FP if I could use say JSPM to global-import it as follows:
// let _ = require('lodash/fp').convert({ 'cap': false });

// pretty print a json object
export function prettyPrint(o: {}): string {
  let replacer = (match, r = '', pKey, pVal, pEnd = '') => r +
    // ((pKey) ? `<span class=json-key>${pKey.replace(/[": ]/g, '')}</span>: ` : '') +
    ((pKey) ? "<span class=json-key>" + pKey.replace(/[": ]/g, '') + "</span>: " : '') +
    ((pVal) ? `<span class=${pVal[0] == '"' ? 'json-string' : 'json-value'}>${pVal}</span>` : '') + pEnd;
  return JSON.stringify(o, null, 3)
  .replace(/&/g, '&amp;')
  .replace(/\\"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg, replacer);
};

// cleanse a string to use as an ID
export function idCleanse(s: string): string {
  return s.replace(/[^\w]+/g, '-').replace(/(^-)|(-$)/g, '');
}

// 'cast' a function such that in case it receives a bad (non-conformant)
// value for input, it will return a default value of its output type
// intercepts bad input values for a function so as to return a default output value
// ... this might hurt when switching to like Immutable.js though.
export function typed<T>(from: any[], to: any, fn: T): T { //T: (...) => to
  return function() {
    for (let i = 0; i < from.length; i++) {
      let frm = from[i];
      let v = arguments[i];
      if(frm && (_.isNil(v) || v.constructor != frm)) return (new to).valueOf();
    }
    return fn.call(this, ...arguments);
  };
}

// wrapper for setter methods, return if not all parameters are defined
export function combine<T>(fn: T, allow_undef: {[key: string]: boolean} = {}): T {
  return function() {
    // let names = /([^\(]+)(?=\))'/.exec(fn.toString()).split(',').slice(1);
    let names = fn.toString().split('(')[1].split(')')[0].split(/[,\s]+/);
    for (let i = 0; i < arguments.length; i++) {
      let v = arguments[i];
      let name = names[i]
        .replace(/_\d+$/, '')   // fixes SweetJS suffixing all names with like _123. this will however break functions already named .*_\d+, e.g. foo_123
        // do not minify the code while uing this function, it will break -- functions wrapped in combine will no longer trigger.
      if(_.isUndefined(v) && !allow_undef[name]) return; // || _.isNil(v)
    }
    fn.call(this, ...arguments);  //return
  };
}

// simpler guard, just a try-catch wrapper with default value
export function fallback<T>(def: any, fn): T {  //fn: (...) => T
  return function() {
    try {
      return fn.call(this, ...arguments);
    }
    catch(e) {
      console.warn('an error occurred, falling back to default value:', e);
      return def;
    }
  };
}

// just log errors. only useful in contexts with silent crash.
export function tryLog<T>(fn: T): T {
  return function() {
    try {
      return fn.call(this, ...arguments);
    }
    catch(e) {
      console.warn('tryLog error:', e);
    }
  };
}

// create a Component, decorating the class with the provided metadata
// export let FooComp = ng2comp({ component: {}, parameters: [], decorators: {}, class: class FooComp {} })
export function ng2comp(o: { component: {}, parameters: Array<void>, decorators: {}, class: Class }): Component {
  let cls = o.class;
  cls.annotations = [new ComponentMetadata(o.component || {})];
  cls.parameters = (o.parameters || []).map(x => x._desc ? x : [x]);
  _.keys(o.decorators).forEach(k => {
    Reflect.decorate([o.decorators[k]], cls.prototype, k);
  });
  // return ng.Component(o.component)(cls);
  return cls;
};

// use to map an array of input schemas to a version with path added
export function inputSchemas(path: Front.Path = []): (v: string, idx: number) => Front.IPathSchema {
  return (v, idx) => ({ path: path.concat(_.get('name')(v) || idx), schema: v });
}

// pars to make a form for a given API function. json-path?
export function methodPars(spec: Front.ApiSpec, fn_path: string): { pars: Front.Schema, desc: string } {
  let hops = ['paths', fn_path, 'get', 'parameters'];
  let path = hops.map(x => idCleanse(x));
  // let scheme = { path: ['schemes'], spec: {name: 'uri_scheme', in: 'path', description: 'The URI scheme to be used for the request.', required: true, type: 'hidden', allowEmptyValue: false, default: spec.schemes[0], enum: spec.schemes}};
  let arr = _.get(hops, spec) || [];
  let schema = schemaFromArr(arr);
  let desc = marked(_.get(_.dropRight(hops, 1).concat('description'))(spec) || '');
  return { pars: schema, desc };
};

// convert an array of schemas to an object schema
let schemaFromArr = (arr) => {
  let names = arr.map(y => y.name);
  let props = _.zipObject(names, arr);
  return { type: 'object', properties: props, required: names };
}

// finds and returns an array of all json paths (as string arrays) of any tables (not within arrays)
// in a JSON schema as suggestions to use as the meat extractor for fetched JSON results.
export function findTables(schema: Front.Schema, path: Front.Path = []): Front.Path[] {
  if (schema.type == 'array' && schema.items.type == 'object') {
    return [path];
  } else {
    if (schema.type == 'object') {
      let keys = _.keys(schema.properties);
      return _.flatten(keys.map(k => findTables(schema.properties[k], path.concat(k))));
    } else {
      return [];
    }
  }
};

// update an OpenAPI/Swagger schema from an older version.
export function updateSpec(specification: Front.ApiSpec): Front.ApiSpec {
  let spec = _.cloneDeep(specification);
  // [Swagger 1.1 to 1.2](https://github.com/OAI/OpenAPI-Specification/wiki/1.2-transition)
  // [1.2 to 2.0](https://github.com/OAI/OpenAPI-Specification/wiki/Swagger-1.2-to-2.0-Migration-Guide)
  // [1.2 to 2.0 tool](https://github.com/apigee-127/swagger-converter)
  // Swagger 2.0 to OpenAPI 3.0:
  delete spec.swagger;
  spec.openapi = '3.0.0';
  spec.hosts = spec.schemes.map(scheme => ({ host: spec.host, basePath: spec.basePath, scheme }));
  delete spec.host;
  delete spec.basePath;
  delete spec.schemes;
  return spec;
};

// TODO: simplify the `_.find` part if with {cap:false} I can make lodash have it expose Object keys.
// for a given object key get the appropriate entry in the schema
export function keySchema(k: string, schema: Front.Schema): Front.Schema {
  return _.get(['properties', k], schema)
  || _.get(['patternProperties', _.find(p => new RegExp(p).test(k))(
    _.keys(_.get(['patternProperties'], schema))
  )], schema)
  || _.get(['additionalProperties'], schema);
};

// find the index of an item within a Set (indicating in what order the item was added).
export function findIndexSet(x: any, set: Set): number {
  return _.findIndex(y => y == x)(Array.from(set));
}

// editVals from elins; map values of an object using a mapper

// only keep properties in original object
export let editValsOriginal: Front.ObjectMapper = (fnObj) => (obj) => mapBoth(obj, (v, k) => {
  let fn = fnObj[k];
  return fn ? fn(v) : v
});

// export let editVals = (fnObj) => (obj) => _.reduce((acc, fn, k) => _.update(k, fn(acc[k]))(acc), obj)(fnObj);
// ^ no k in FP
// keep all original properties, map even over keys not in the original object
export let editValsBoth: Front.ObjectMapper = (fnObj) => (obj) => _.keys(fnObj).reduce((acc, k) => _.update(k, fnObj[k])(acc), obj);

// only keep properties in mapper object, map even over keys not in the original object
export let editValsLambda: Front.ObjectMapper = (fnObj) => (obj) => mapBoth(fnObj, (fn, k) => {
  let v = obj[k];
  return fn ? fn(v) : v
});

// split an object into its keys and values: `let [keys, vals] = splitObj(obj);`
export function splitObj(obj: {}): [keys: string[], values: any[]] {
  return [_.keys(obj), _.values(obj)];
}

// http://www.2ality.com/2012/04/eval-variables.html
// evaluate an expression within a context (of the component)
export let evalExpr = (context: {}, vars: {} = {}) => (expr: string) => {
    let varArr = [context, vars];
    let propObj = Object.assign({}, ...[...varArr, ...varArr.map(x => Object.getPrototypeOf(x))]
        .map(x => arr2obj(Object.getOwnPropertyNames(x), k => x[k])));
    let [keys, vals] = splitObj(propObj);
    let fn = Function.apply(context, keys.concat(`return ${expr}`));
    return fn.apply(context, vals);
}

// print a complex object for debugging -- regular log sucks cuz it elides values, JSON.stringify errors on cyclical structures.
export function print(k: string, v: {}): void {
  let cname = v => v ? v.constructor.name : null;
  let cnames = _.mapValues(cname);
  console.log(k, cname(v), cnames(v));
};

// transform a value while the predicate holds true
export function transformWhile<T>(predicate: (T) => boolean, transformer: (T) => T, v: T): T {
  while(predicate(v)) {
    v = transformer(v);
  }
  return v;
}

export class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export function getSafe(path: string[]): Function {
  // console.log('getSafe', path);
  // return _.get(path);
  return _.size(path) ? _.get(path) : y => y;
}

// [ng1 material components](https://github.com/Textalk/angular-schema-form-material/tree/develop/src)
// [type map](https://github.com/Textalk/angular-schema-form/blob/development/src/services/schema-form.js)
// [swagger editor ng1 html](https://github.com/swagger-api/swagger-editor/blob/master/app/templates/operation.html)
// json editor:
// - functional [elements](https://github.com/flibbertigibbet/json-editor/blob/develop/src/theme.js)
// - [overrides](https://github.com/flibbertigibbet/json-editor/blob/develop/src/themes/bootstrap3.js)
