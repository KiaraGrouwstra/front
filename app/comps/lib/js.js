let _ = require('lodash/fp');
let $ = require('jquery');
let ng = require('angular2/core');
let marked = require('marked');
import { ComponentMetadata } from 'angular2/core';

require("materialize-css/dist/js/materialize.min");
// let YAML = require('yamljs');

export let RegExp_escape = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

// wrap into lodash like here?
// https://github.com/jonahkagan/schematic-ipsum/blob/master/src/underscoreExt.coffee
export let arr2obj = (arr, fn) => _.zipObject(arr, arr.map(fn));
// let arr2obj = (arr, fn) => _.fromPairs(arr.map(k => [k, fn(k)]));

export let arr2map = (arr, fn) => arr.reduce((map, k) => map.set(k, fn(k)), new Map());

export let do_return = (fn) => (v) => {
  fn(v);
  return v;
}

export let Prom_toast = function(msg) {
  // return this.do(_v => toast.success(msg), e => toast.error(e));
  return this.then(do_return(_v => toast.success(msg)), do_return(e => toast.error(e)));
}
Promise.prototype.toast_result = Prom_toast;

export let handle_auth = (url, fn) => {
  let url_bit = (url, part) => {
    let par_str = url[part].substring(1);
    let params = decodeURIComponent(par_str).split('&');
    return arr2obj(params, y => y.split('='));
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

export let popup = (popup_url, watch_url) => new Promise((resolve, reject) => {
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
export let toast = arr2obj(Object.keys(toasts), (kind) => (msg, ms = 1000) => {
  let level = toasts[kind].val;
  if(level >= TOAST_LEVEL) Materialize.toast(msg, ms, toasts[kind].class);
  if(level >= LOG_LEVEL) console.log(`${kind}:`, msg);
});

export let setKV = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export let getKV = (k) => new Promise((resolve, reject) => {
  let saved = localStorage.getItem(k);
  if(saved != null) {
    resolve(JSON.parse(saved));
  } else {
    reject(`key ${k} not found`);
  }
}).toast_result(`loaded data for ${k}!`);

// let range = (n) => Array(n).fill().map((x,i)=>i);
// let spawn_n = (fn, n = 5, interval = 1000) => range(n).forEach((x) => setTimeout(fn, x * interval));
// let yaml2json = _.flow(YAML.parse, JSON.stringify);
// let yaml2json = (yml) => JSON.stringify(YAML.parse(yml));
export let mapBoth = (obj, fn) => {
  let keys = Object.keys(obj);
  // return _.zipObject(keys, keys.map(k => fn(obj[k], k)));
  return arr2obj(keys, k => fn(obj[k], k));
}
// _.mapValues.convert({ 'cap': false })
// ^ I could ditch this mapBoth crap for Lodash/FP if I could use say JSPM to global-import it as follows:
// let _ = require('lodash/fp').convert({ 'cap': false });

// pretty print a json object
export let prettyPrint = (o) => {
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
}

// cleanse a string to use as an ID
export let id_cleanse = (s) => s.replace(/[^\w]+/g, '-').replace(/(^-)|(-$)/g, '');

// 'cast' a function such that in case it receives a bad (non-conformant)
// value for input, it will return a default value of its output type
// intercepts bad input values for a function so as to return a default output value
// ... this might hurt when switching to like Immutable.js though.
export let typed = (from, to, fn) => function() {
  for (var i = 0; i < from.length; i++) {
    let frm = from[i];
    let v = arguments[i];
    if(frm && (_.isUndefined(v) || _.isNull(v) || v.constructor != frm)) return (new to).valueOf();
  }
  return fn.call(this, ...arguments);
}

// wrapper for setter methods, return if not all parameters are defined
export let combine = (fn, allow_undef = {}) => function() {
  // let names = /([^\(]+)(?=\))'/.exec(fn.toString()).split(',').slice(1);
  let names = fn.toString().split('(')[1].split(')')[0].split(/[,\s]+/);
  for (var i = 0; i < arguments.length; i++) {
    let v = arguments[i];
    let name = names[i]
      .replace(/_\d+$/, '')   // fixes SweetJS suffixing all names with like _123. this will however break functions already named .*_\d+, e.g. foo_123
      // do not minify the code while uing this function, it will break -- functions wrapped in combine will no longer trigger.
    if(_.isUndefined(v) && !allow_undef[name]) return; // || _.isNull(v)
  }
  fn.call(this, ...arguments);  //return
}

// simpler guard, just a try-catch wrapper with default value
export let fallback = (def, fn) => function() {
  try {
    return fn.call(this, ...arguments);
  }
  catch(e) {
    console.log('an error occurred, falling back to default value:', e);
    return def;
  }
}

// just log errors. only useful in contexts with silent crash.
export let tryLog = (fn) => function() {
  try {
    return fn.call(this, ...arguments);
  }
  catch(e) {
    console.log('tryLog error:', e);
  }
}

// create a Component, decorating the class with the provided metadata
// export let FooComp = ng2comp({ component: {}, parameters: [], decorators: {}, class: class FooComp {} })
export let ng2comp = (o) => {
  let cls = o.class;
  cls.annotations = [new ComponentMetadata(o.component || {})];
  cls.parameters = (o.parameters || []).map(x => x._desc ? x : [x]);
  Object.keys(o.decorators || {}).forEach(k => {
    Reflect.decorate([o.decorators[k]], cls.prototype, k);
  });
  // return ng.Component(o.component)(cls);
  return cls;
}

// use to map an array of input specs to a version with path added
export let input_specs = (path = []) => (v, idx) => ({ path: path.concat(_.get('name')(v) || idx), spec: v })

// pars to make a form for a given API function
export let method_pars = (spec, fn_path) => {
  // I'd consider json path, but [one implementation](https://github.com/flitbit/json-path) needs escaping
  // [the other](https://github.com/s3u/JSONPath/) uses async callbacks...
  // http://jsonpath.com/ -> $.paths./geographies/{geo-id}/media/recent.get.parameters
  let hops = ['paths', fn_path, 'get', 'parameters'];
  let path = hops.map(x => id_cleanse(x));
  // let scheme = { path: ['schemes'], spec: {name: 'uri_scheme', in: 'path', description: 'The URI scheme to be used for the request.', required: true, type: 'hidden', allowEmptyValue: false, default: spec.schemes[0], enum: spec.schemes}};
  let pars = (_.get(hops, spec) || []).map(input_specs(path));  //[scheme].concat()
  let desc = marked(_.get(_.dropRight(hops, 1).concat('description'))(spec) || '');
  return { pars, desc };
}

// finds and returns an array of all json paths (as string arrays) of any tables (not within arrays)
// in a JSON schema as suggestions to use as the meat extractor for fetched JSON results.
export let findTables = (spec, path = []) => {
  if (spec.type == 'array' && spec.items.type == 'object') {
    return [path];
  } else {
    if (spec.type == 'object') {
      let keys = Object.keys(spec.properties);
      return _.flatten(keys.map(k => findTables(spec.properties[k], path.concat(k))));
    }
  }
}

export let updateSpec = (specification) => {
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
}

// TODO: simplify the `_.find` part if with {cap:false} I can make lodash have it expose Object keys.
// for a given object key get the appropriate openapi spec
export let key_spec = (k, spec) => {
  return _.get(['properties', k], spec)
  || _.get(['patternProperties', _.find(p => new RegExp(p).test(k))(
    Object.keys(_.get(['patternProperties'], spec) || {})
  )], spec)
  || _.get(['additionalProperties'], spec);
}

// [ng1 material components](https://github.com/Textalk/angular-schema-form-material/tree/develop/src)
// [type map](https://github.com/Textalk/angular-schema-form/blob/development/src/services/schema-form.js)
// [swagger editor ng1 html](https://github.com/swagger-api/swagger-editor/blob/master/app/templates/operation.html)
// json editor:
// - functional [elements](https://github.com/flibbertigibbet/json-editor/blob/develop/src/theme.js)
// - [overrides](https://github.com/flibbertigibbet/json-editor/blob/develop/src/themes/bootstrap3.js)
