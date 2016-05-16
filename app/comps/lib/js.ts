let _ = require('lodash/fp');
let $ = require('jquery');
let ng = require('@angular/core');
let marked = require('marked');
import { ComponentMetadata } from '@angular/core';

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

export function do_return<T>(fn: (T) => void): (v: T) => T {
  return (v) => {
    fn(v);
    return v;
  };
}

export function Prom_toast(msg: string): Promise {
  // return this.do(_v => toast.success(msg), e => toast.error(e));
  return this.then(do_return(_v => toast.success(msg)), do_return(e => toast.error(e)));
};
Promise.prototype.toast_result = Prom_toast;

export function handle_auth(url: string, fn: (get: string, hash: string) => void): void {
  let url_bit = (url: string, part: string) => {
    let par_str = url[part].substring(1);
    let params = decodeURIComponent(par_str).split('&');
    return arr2obj(params, y => y.split('='));
  }
  let url_get_hash = (url: string) => ['search', 'hash'].map(x => url_bit(url, x));
  let [get, hash] = url_get_hash(url);
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
}

const toasts: Front.ILogLevels<{ val: number, class: string }> = {
  debug: { val: 0, class: 'grey' },
  info: { val: 1, class: 'blue' },
  success: { val: 2, class: 'green' },
  warn: { val: 3, class: 'orange' },
  error: { val: 4, class: 'red' },
};
const TOAST_LEVEL = toasts.success.val;
const LOG_LEVEL = toasts.info.val;
export let toast: Front.ILogLevels<(msg: string, ms: number) => void> =
  arr2obj(_.keys(toasts), (kind: string) => (msg: string, ms = 1000: number) => {
    let level = toasts[kind].val;
    if(level >= TOAST_LEVEL) Materialize.toast(msg, ms, toasts[kind].class);
    if(level >= LOG_LEVEL) console.log(`${kind}:`, msg);
});

export function setKV(k: string, v: any): void {
  localStorage.setItem(k, JSON.stringify(v));
}

export function getKV(k: string): Promise {
  return new Promise((resolve, reject) => {
    let saved = localStorage.getItem(k);
    if(saved != null) {
      resolve(JSON.parse(saved));
    } else {
      reject(`key ${k} not found`);
    }
  }).toast_result(`loaded data for ${k}!`);
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
export function id_cleanse(s: string): string {
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

// use to map an array of input specs to a version with path added
export function input_specs(path: Front.Path = []): (v: string, idx: number) => Front.IPathSpec {
  return (v, idx) => ({ path: path.concat(_.get('name')(v) || idx), spec: v });
}

// pars to make a form for a given API function. json-path?
export function method_pars(spec: Front.Spec, fn_path: string): { pars: Front.Spec, desc: string } {
  let hops = ['paths', fn_path, 'get', 'parameters'];
  let path = hops.map(x => id_cleanse(x));
  // let scheme = { path: ['schemes'], spec: {name: 'uri_scheme', in: 'path', description: 'The URI scheme to be used for the request.', required: true, type: 'hidden', allowEmptyValue: false, default: spec.schemes[0], enum: spec.schemes}};
  let arr = _.get(hops, spec) || [];
  let pars = specFromArr(arr);
  let desc = marked(_.get(_.dropRight(hops, 1).concat('description'))(spec) || '');
  return { pars, desc };
};

// convert an array of specs to an object spec
let specFromArr = (arr) => {
  let names = arr.map(y => y.name);
  let props = _.zipObject(names, arr);
  return { type: 'object', properties: props, required: names };
}

// finds and returns an array of all json paths (as string arrays) of any tables (not within arrays)
// in a JSON schema as suggestions to use as the meat extractor for fetched JSON results.
export function findTables(spec: Front.Spec, path: Front.Path = []): Front.Path[] {
  if (spec.type == 'array' && spec.items.type == 'object') {
    return [path];
  } else {
    if (spec.type == 'object') {
      let keys = _.keys(spec.properties);
      return _.flatten(keys.map(k => findTables(spec.properties[k], path.concat(k))));
    }
  }
};

// update an OpenAPI/Swagger schema from an older version.
export function updateSpec(specification: Front.Spec): Front.Spec {
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
// for a given object key get the appropriate entry in the spec
export function key_spec(k: string, spec: Front.Spec): Front.Spec {
  return _.get(['properties', k], spec)
  || _.get(['patternProperties', _.find(p => new RegExp(p).test(k))(
    _.keys(_.get(['patternProperties'], spec))
  )], spec)
  || _.get(['additionalProperties'], spec);
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
export let evalExpr: (vars: {}) => (expr: string) => any =
  (vars: {}) => (expr: string) => {
    let propObj = _.assign(...[vars, Object.getPrototypeOf(vars)].map(x => arr2obj(Object.getOwnPropertyNames(x), k => x[k])));
    let [keys, vals] = splitObj(propObj);
    // Function(param1, ..., paramn, body)
    let fn = Function.apply(vars, keys.concat([`return ${expr}`]));
    return fn.apply(vars, vals);
    // let fn = Function.apply(vars, [`return ${expr}`]);
    // return fn.apply(vars);
}

// print a complex object for debugging -- regular log sucks cuz it elides values, JSON.stringify errors on cyclical structures.
export function print(k: string, v: {}): void {
  let cname = v => v ? v.constructor.name : null;
  let cnames = _.mapValues(cname);
  console.log(k, cname(v), cnames(v));
};

// [ng1 material components](https://github.com/Textalk/angular-schema-form-material/tree/develop/src)
// [type map](https://github.com/Textalk/angular-schema-form/blob/development/src/services/schema-form.js)
// [swagger editor ng1 html](https://github.com/swagger-api/swagger-editor/blob/master/app/templates/operation.html)
// json editor:
// - functional [elements](https://github.com/flibbertigibbet/json-editor/blob/develop/src/theme.js)
// - [overrides](https://github.com/flibbertigibbet/json-editor/blob/develop/src/themes/bootstrap3.js)
