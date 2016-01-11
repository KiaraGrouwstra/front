// "use strict";
// let is_node = typeof window === 'undefined'

// let jsonPath = require('JSONPath');
let _ = require('lodash');
// let probe = require('titon-probe')
// let _ = probe._
// let _s = probe._s
let tv4 = require('tv4');
let jQuery = require('jquery'); //$ =
let marked = require('marked');
let jade = require('jade');
import { arrToSet } from './rx_helpers';  //, elemToArr, arrToArr, elemToSet, setToSet, loggers, notify
// require('rxjs/Observable');
import {Observable} from 'rxjs/Observable';
import { Array_last, Array_has, Array_clean, Array_flatten, Object_filter, RegExp_escape, arr2obj, toast, mapBoth, String_stripOuter } from './js.js'; //, Obs_do, Obs_then
// Observable.prototype.do = Obs_do;
// Observable.prototype.then = Obs_then;
import { Validators, Control } from 'angular2/common';
Array.prototype.last = Array_last;
Array.prototype.has = Array_has;
Array.prototype.clean = Array_clean;
Array.prototype.flatten = Array_flatten;
String.prototype.stripOuter = String_stripOuter;

//let nuller = () => null;
let nuller = (a, b, c, d, e) => {
  console.log("ERROR: no handler found", a, b, c, d, e);
  return null;
};

// let Kinds = { FIXED: 1, PATTERN: 2, ADDITIONAL: 3 }
// var SymbolEnum = require('symbol-enum')
// var Kinds = new SymbolEnum('FIXED', 'PATTERN', 'ADDITIONAL')  //Kinds.FIXED
let SCALARS = ["boolean", "integer", "number", "string", "null", "scalar"];
// if(is_node) {  //node (gulp, fs)
//   let fs = require('fs');
//   var Templates = _.mapValues({
//     // output
//     card_object: 'output/card_object', //- {k, id, scal: {k -> {type, pars}}, obj: {k -> {type, pars}}, arr: {k -> {type, pars}}}
//     card_table: 'output/card_table', //- {k, id, cols: [{k, id}], rows: [{id, cells: [{id, val}]}]}
//       ul_table: 'output/ul_table', //- {k, id, rows: [{id, val}]}
//       dl_table: 'output/dl_table', //- {rows: [{k, id, val}]}
//       dl      : 'output/dl',       //- {rows: [{k, id, val}]}
//       // input
//       input: 'ng-input/input-block', //- {id, model, type, required, placeholder?, control?}
//       // input: 'ng-input/input', //- {id, model, type, required, placeholder?, control?}
//       // field: 'ng-input/field', //- {html, k, label}
//       form: 'ng-input/form', //- {fields: [html]}
//   }, x => {
//     let path = `..$/{__dirname}/jade/${x}.jade`
//     let tmplt = fs.readFileSync(path, 'utf8')
//     return jade.compile(tmplt, {filename: path})
//     // ^ using `extends` needs file-system knowledge, so pre-render using `gulp-jade`... when I can load this ES6 from Gulp without errors.
//   })
// } else {  //browser (webpack)
  let wrap = (wrapper, block) => (opts) => Templates[wrapper](Object.assign(opts, {html: Templates[block](opts)}))
  var Templates = _.mapValues({
    // output
    card_object: require('!raw!../jade/output/card_object.jade'), //- {k, id, scal: {k -> {type, pars}}, obj: {k -> {type, pars}}, arr: {k -> {type, pars}}}
    card_table: require('!raw!../jade/output/card_table.jade'), //- {k, id, cols: [{k, id}], rows: [{id, cells: [{id, val}]}]}
      ul_table: require('!raw!../jade/output/ul_table.jade'), //- {k, id, rows: [{id, val}]}
      dl_table: require('!raw!../jade/output/dl_table.jade'), //- {rows: [{k, id, val}]}
      dl      : require('!raw!../jade/output/dl.jade'),       //- {rows: [{k, id, val}]}
    // input
    // input: require('!raw!../jade/ng-input/input-block.jade'), //- {id, model, type, required, placeholder?, control?}
    input_s: require('!raw!../jade/ng-input/input.jade'), //- {attrs: {[(ngModel)], ngControl, id, type, required, placeholder?, `#${ngControl}`: "ngForm"}}
    // input:   require('!raw!../jade/ng-input/input.jade'), //- {attrs: {[(ngModel)], ngControl, id, type, required, placeholder?, `#${ngControl}`: "ngForm"}}
    switch: require('!raw!../jade/ng-input/switch.jade'),
    // radio: require('!raw!../jade/ng-input/radio.jade'),
    range: require('!raw!../jade/ng-input/range.jade'),
    select: require('!raw!../jade/ng-input/select.jade'),
    datalist: require('!raw!../jade/ng-input/datalist.jade'),
    date: require('!raw!../jade/ng-input/date.jade'),
    field: require('!raw!../jade/ng-input/field.jade'), //- {html, k, label}
    form: require('!raw!../jade/ng-input/form.jade'), //- {fields: [html]}
  }, t => jade.compile(t, {}))    //filename:
  Object.assign(Templates, {
    input: wrap('field', 'input_s'),
  })
  // ^ using extends would require me to load the Jade from a web directory... now I was preloading by webpack to prevent duplicate work. guess caching helps though?
// }

let infer_type = (v) => Array.isArray(v) ? "array" : _.isObject(v) ? "object" : "scalar"

let try_schema = (val, swag) => {
  let options = _.get(swag, ['oneOf']) || _.get(swag, ['anyOf']) || _.get(swag, ['allOf']) || []
  let tp = _.find(options, (schema, idx, arr) => tv4.validate(val, schema, false, false, false))
  return _.get(tp,['type']) ? tp :
    _.any(['oneOf','anyOf','allOf'], x => _.get(tp,[x])) ?
    try_schema(val, tp) : null //infer_type(val)
}

function getHandler(type, map) {
  let key = (SCALARS.has(type)) ? "scalar" : type;
  return map[key] || nuller;  // not actually nothing! just means I don't have sufficient info to infer the type...
}

// turns JSON plus its spec into html
function parseVal(path, api_spec, swagger) {
  let type_map = {
    //array of multiple,
    "array": parseArray,  //uniqueItems: true -> Set
    "object": parseObject,
    "scalar": parseScalar, //for string input consider pattern (regex), format: uri, email, regex
  };
  swagger = _.get(swagger,['type']) ? swagger : try_schema(api_spec, swagger)
  let tp = _.get(swagger, ['type']) || infer_type(api_spec)
  let fn = getHandler(tp, type_map);
  return fn(path, api_spec, swagger, false);
  //enum: white-listed values (esp. for string) -- in this case make scalars like radioboxes/drop-downs for input, or checkboxes for enum'd string[].
}

function parseArray(path, api_spec, swagger, named = false) {
  //type:array, uniqueItems, minItems, maxItems, default, items/anyOf/allOf/oneOf, additionalItems
  //no array of multiple, this'd be listed as anyOf/allOf or additionalItems, both currently unimplemented,
  //number: multipleOf, maximum, exclusiveMaximum, minimum, exclusiveMinimum
  //string: maxLength, minLength, format
  let type_map = {
    "array": make_ul, //parseNested,
    "object": make_table,
    "scalar": make_ul, //parseList,
  };
  let first = _.get(api_spec,[0])
  swagger = _.get(swagger, ['items', 'type']) ? swagger.items : try_schema(first, _.get(swagger, ['items']))
  let tp = _.get(swagger, ['type']) || infer_type(first)
  let fn = getHandler(tp, type_map);
  return makeTemplate(fn, path, api_spec, swagger, named);
}

// for a given object key get the appropriate swagger spec
let key_spec = (
  k,
  swagger,
  fixed,  // = get_fixed(swagger, api_spec)
  patts = get_patts(swagger)
) => {
  // let kind = Kinds.ADDITIONAL
  let swag = _.get(swagger, ['additionalProperties'])
  if(fixed.has(k)) {
    // kind = Kinds.FIXED
    swag = swagger.properties[k]
  } else {
    patts.forEach(p => {
      if(new RegExp(p).test(k)) {
        // kind = Kinds.PATTERN
        swag = swagger.patternProperties[p]
        // v.patt = p
      }
    })
  }
  return swag;
  // return {kind: kind, swag: swag};
}

let get_fixed = (swag, api) => {
  let keys = Object.keys(api);
  return Object.keys(_.get(swag, ['properties']) || {}).filter(k => keys.has(k));
}

let id_cleanse = (s) => s.replace(/[^\w]+/g, '-').replace(/(^-)|(-$)/g, '')

let get_patts = (swag) => Object.keys(_.get(swag, ['patternProperties']) || {})

function parseObject(path, api_spec, swagger, named = false) {
  //not
  let {id: id, k: k} = getPaths(path)
  // let Types = { ANY: 0, SCALAR: 1, ARRAY: 2, OBJECT: 3 }
  let keys = Object.keys(api_spec);
  let fixed = get_fixed(swagger, api_spec)
  let patts = get_patts(swagger)
  let coll = _.object(keys, keys.map(k => {
    // let v = {swag: swagger.additionalProperties, pars: null} //Types.ANY, type: "any", kind: Kinds.ADDITIONAL, patt: null
    let swag = key_spec(k, swagger, fixed, patts)
    // let {kind: kind, swag: swag} = key_spec(k, swagger, fixed, patts)
    let path_k = path.concat(id_cleanse(k));
    let pars = [path_k, api_spec[k], swag] //v.
    let tp = _.get(swag, ['type']) || infer_type(api_spec[k])
    if(SCALARS.has(tp)) tp = "scalar"
    return {pars: pars, type: tp}  //swag: swag, kind: kind,
  }).clean())

  let [scalars, arrays, objects] = ['scalar','array','object'].map(x => Object_filter(coll, v => v.type == x))
  let scal = make_dl(path, api_spec, swagger, scalars)
  // ES7 Object.values...
  let obj = Object.keys(objects).map(k => parseObject(...objects[k].pars, true))
  let arr = Object.keys(arrays).map(k => parseArray(...arrays[k].pars, true))
  return Templates.card_object({k: k, id: id, scal: scal, obj: obj, arr: arr, named: named })
}


let getPaths = (path) => {
  let k = path.last();
  let id = path.join('-');  // /^[a-zA-Z][\w:.-]*$/
  let model = path.join('?.');  //ng2 elvis operator to prevent crashing if some element is missing
  // let model = path.join('.');
  // let elvis = path.join('?.');
  let variable = id.replace(/-/g, '_')
  return {k: k, id: id, model: model, variable: variable}
}

function makeTemplate(fn, path, api_spec, swagger, named = false) {
  let {k: k, id: id, model: model} = getPaths(path)
  return fn(path, api_spec, swagger, k, id, model, named);
}

// let tooltip = o => o.description ? ` class="tooltipped" data-position="bottom" data-delay="50" data-tooltip="${o.description}"` : '';

function make_ul(path, api_spec, swagger, k, id, model, named = false, template = Templates.ul_table) {
  let rows = (api_spec || []).map((v, idx) => {
    let path_k = path.concat(idx)
    let val = parseVal(path_k, v, _.get(swagger, ['items']))
    return Object.assign(getPaths(path_k), {val: val})
  });
  return template({k: k, id: id, rows: rows, named: named})
}

function make_dl(path, api_spec, swagger, scalar_coll, template = Templates.dl_table) {
  // return `<dl id="${id}"><div *ng-for="#item of ${model}"><dt>{{item}}</dt><dd>{{item}}</dd></div></dl>\r\n`;
  let rows = Object.keys(scalar_coll).map(k => {
    let val = parseVal(...scalar_coll[k].pars)
    return Object.assign(getPaths(path.concat(k)), {val: val})
  });
  return template({rows: rows})
}

function make_table(path, api_spec, swagger, k, id, model, named = false, template = Templates.card_table) {
  let fixed = get_fixed(swagger, api_spec)
  let patts = get_patts(swagger)
  let col_keys = Array.from(api_spec
    .map(x => Object.keys(x))
    .reduce(arrToSet, new Set)
  )
  let cols = col_keys.map(k => getPaths(path.concat(k)))
  let rows = api_spec.map((rw, idx) => {
    let {k: k, id: id, model: model} = getPaths(path.concat(idx))
    let cells = col_keys.map(col => {
      let k_path = path.concat([idx, col])
      let val = parseVal(k_path, rw[col], key_spec(col, swagger, fixed, patts))
      return Object.assign(getPaths(k_path), {val: val})
    })
    return {id: id, cells: cells}
  });
  return template({k: k, id: id, cols: cols, rows: rows, named: named})
}

// meant to use without makeTemplate
function parseScalar(path, api_spec, swagger) {
  let val = `${api_spec}`
  if(path.last() == "description") {
    val = `<span class="markdown">${marked(val)}</span>`  // swagger MD descs, wrapped to ensure 1 node
  }
  switch (_.get(swagger, ['format'])) {
    case "uri": val = `<a href="${val}">${val}</a>`; break;
    case "email": val = `<a href="mailto:${val}">${val}</a>`; break;
    // default:
  }
  return val;
}

// ng1 material components: https://github.com/Textalk/angular-schema-form-material/tree/develop/src
// accompanying logic + type mapping: https://github.com/Textalk/angular-schema-form/blob/development/src/services/schema-form.js#L233
// swagger editor ng1 html: https://github.com/swagger-api/swagger-editor/blob/master/app/templates/operation.html
// json editor: functional [elements](https://github.com/flibbertigibbet/json-editor/blob/develop/src/theme.js), [overrides](https://github.com/flibbertigibbet/json-editor/blob/develop/src/themes/bootstrap3.js)

// get the default value for a value type
let get_default = (type) => {
  let def_vals = {
    string: '',
    number: 0,
    integer: 0,
    boolean: false,
    array:   [],
    object:  {},
    // file: 'file', //[],
  }
  return _.get(def_vals, [type], null)
}

// get the input type for a value type
let input_type = (type) => _.get({
    string: 'text',
    number: 'number',
    integer: 'number',
    boolean: 'checkbox',
    file: 'file',
  }, [type], type)

// pick a Jade template
let get_template = (opts) => _.get({
  string: opts.enum_options ? 'datalist' : null, //select, radio
  integer: (opts.attrs.max > opts.attrs.min) ? 'range' : null,
  boolean: 'switch',
  date: 'date',
  // number: null,
  // array: [checkboxes, array],
  // object: [fieldset],
}, [opts.type], 'input') || 'input'

// get the input template for a given parameter
// http://swagger.io/specification/#parameterObject
let param_field = (path, api_spec) => {
  // general parameters
  let { name: name, in: kind, description: desc, required: req, schema: schema, type: type, format: format, allowEmptyValue: allow_empty, items: items, collectionFormat: collectionFormat, default: def, maximum: inc_max, exclusiveMaximum: ex_max, minimum: inc_min, exclusiveMinimum: ex_min, maxLength: maxLength, minLength: minLength, pattern: pattern, maxItems: maxItems, minItems: minItems, uniqueItems: uniqueItems, enum: enum_options, multipleOf: multipleOf } = api_spec
  let label = marked(`**${name}:** ${desc}`);
  desc = marked(desc || '') //.stripOuter();
  let { id: id, k: k, model: elvis, variable: variable } = getPaths(path)
  let key = name  // variable
  let model = `form.controls.${key}`
  let attrs = {
    '[(ngModel)]': `${model}.value`,
    ngControl: key,
    id: id,
    required: req,
  }
  // if(desc) marked)(attrs.placeholder = description;;
  attrs[`#${variable}`] = 'ngForm';

  // numbers:
  let max = inc_max || ex_max ? ex_max + 1 : null
  let min = inc_min || ex_min ? ex_min - 1 : null

  let AUTO_COMP = ['name', 'honorific-prefix', 'given-name', 'additional-name', 'family-name', 'honorific-suffix', 'nickname', 'email', 'username', 'new-password', 'current-password', 'organization-title', 'organization', 'street-address', 'address-line1', 'address-line2', 'address-line3', 'address-level4', 'address-level3', 'address-level2', 'address-level1', 'country', 'country-name', 'postal-code', 'cc-name', 'cc-given-name', 'cc-additional-name', 'cc-family-name', 'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type', 'transaction-currency', 'transaction-amount', 'language', 'bday', 'bday-day', 'bday-month', 'bday-year', 'sex', 'tel', 'url', 'photo']

  // type-specific parameters
  let type_params = {
    string: {
      maxlength: maxLength,
      minlength: minLength,
      pattern: pattern,
      title: 'title test', //still used in native browser 'required' popup?
      'data-tooltip': desc,
      autocomplete: AUTO_COMP.has(name) ? name : 'on', //off
    },
    number: {
      max: max,
      min: min,
      step: multipleOf,
    },
    integer: {
      max: max,
      min: min,
      step: multipleOf || 1,
    },
  }
  let extra = _.get(type_params, [type], {})
  Object.assign(attrs, extra)

  // type-specific parameter edits
  switch(type) {
    case 'string':
      // parameters: allowEmptyValue:false, maxLength, minLength, pattern, format
      if(allow_empty) minlength = 0
      // format: http://swagger.io/specification/#dataTypeFormat
      // int32, int64, float, double, byte, binary, date, date-time, password; any other like email, uuid, ...
      let INPUT_TYPES = ['button', 'checkbox', 'color', 'date', 'datetime', 'datetime-local', 'email', 'file', 'hidden', 'image',
              'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week']
      if(format == 'date-time') format = 'datetime'
      if(INPUT_TYPES.has(format)) type = format
      if(enum_options && !pattern) pattern = enum_options.map(s => RegExp_escape(s)).join('|')
      break;
    // case 'array':
    // parameters: items, collectionFormat:csv(/ssv/tsv/pipes/multi), maxItems, minItems, uniqueItems
    //   break;
  }

  let val_fns = mapBoth(val_conds, (fn, k) => (par) => (c) => fn(c.value, par) ? _.object([[k, true]]) : null);
  Object.assign(Validators, val_fns);
  // 'schema', 'format', 'items', 'collectionFormat', 'type'
  let val_keys = ['required', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems', 'minItems', 'uniqueItems', 'enum', 'multipleOf']
  let used_vals = val_keys.filter(k => api_spec[k] != null)
  let validators = used_vals.map(k => Validators[k](api_spec[k]));
  let validator = Validators.compose(validators);
  let val_msgs = arr2obj(used_vals, k => val_errors[k](api_spec[k]));

  // get the html template for the given settings
  attrs.type = input_type(type)
  let hidden = type == 'hidden';
  let opts = { attrs: attrs, type: type, opts: enum_options, id: id, ctrl: model, label: label, validators: val_msgs, hidden: hidden }
  let template = Templates[get_template(opts)]
  // console.log('template', template)
  let field = template(opts)

  // return the html along with its initial key/value pair for the model
  let val = (typeof def !== 'undefined') ? def : get_default(type)
  let ctrl = new Control(val, validator)
  //console.log('ctrl', ctrl);
  let obj = _.object([[key, { type: kind, val: ctrl }]]) // ctrl  //val
  return {html: field, obj: obj}
}

// get the form template for a given API function
let method_form = (api_spec, fn_path, tmplt = Templates.form) => {
  let hops = ['paths', fn_path, 'get', 'parameters']
  let path = hops.map(x => id_cleanse(x))
  // I'd consider json path, but [one implementation](https://github.com/flitbit/json-path) needs escaping
  // [the other](https://github.com/s3u/JSONPath/) uses async callbacks...
  // http://jsonpath.com/ -> $.paths./geographies/{geo-id}/media/recent.get.parameters
  let scheme = param_field(['schemes'], {name: 'uri_scheme', in: 'path', description: 'The URI scheme to be used for the request.', required: true, type: 'hidden', allowEmptyValue: false, default: api_spec.schemes[0], enum: api_spec.schemes})
  let fields = [scheme].concat(_.get(api_spec, hops, []).map((v, idx) => param_field(path.concat(idx), v)))
  // console.log('fields', fields)
  let desc = marked(_.get(api_spec, _.dropRight(hops, 1).concat('description'), ''))
  let html = tmplt({ desc: desc, fields: fields.map(x => x.html) })
  // console.log('html', html)
  //console.log('fields', fields)
  let obj = fields.length ? Object.assign(...fields.map(x => x.obj)) : {}
  //console.log('obj', obj)
  return {html: html, obj: obj}
}

// return the form submit function for an API function
let get_submit = (api_spec, fn_path, get_token, cb = (x) => {}) => function() {
  // console.log('form values', JSON.stringify(this.form.value));
  let base = `{uri_scheme}://${api_spec.host}${api_spec.basePath}`;  //${api_spec.schemes}
  let [p_path, p_query, p_header, p_form, p_body] = ['path', 'query', 'header', 'form', 'body'].map(x => {
    let filtered = Object_filter(this.params, v => v.type == x);
    return _.mapValues(filtered, 'val._value');   //val._value    //val
  });
  let fold_fn = (acc, v, idx, arr) => acc.replace(`{${v}}`, p_path[v]);
  //let url = Object.keys(p_path).reduce(fold_fn, `${base}${fn_path}`) +
  //    (p_query.length ? '?' : '') + global.$.param(p_query)
  let url = Object.keys(p_path).reduce(fold_fn, `${base}${fn_path}?`)
      + global.$.param(Object.assign({ access_token: get_token() }, p_query));
  // console.log(url, p_header);
  // return this.parent.addUrl(url);

  toast.info(`GET ${url}`);
  this.parent.addUrl(url).subscribe(x => {
    toast.success(`got ${url}`);
    cb(x);
  });

  //case 'form':
    // post payload (mutex with form)
    // application/x-www-form-urlencoded: foo=1&bar=swagger
    // multipart/form-data: `Content-Disposition: form-data; name="submit-name"`
  //case 'body':
    // post payload (mutex with form)
    // handle by schema instead of type
};

// validators

let val_conds = {
  required: (v, par) => (v == null || v.length == 0),
  // schema: (v, par) => (v, par),
  // format: (v, par) => (v, par),
  // items: (v, par) => (v, par),
  // collectionFormat: (v, par) => (v, par),
  maximum: (v, par) => (v > par),
  exclusiveMaximum: (v, par) => (v >= par),
  minimum: (v, par) => (v < par),
  exclusiveMinimum: (v, par) => (v <= par),
  // maxLength: (v, par) => (v.length > par), //predefined
  // minLength: (v, par) => (v.length < par), //predefined
  pattern: (v, par) => (! new RegExp(`^${par}$`).test(v)),  //escape pattern backslashes?
  maxItems: (v, par) => (v.length > par),
  minItems: (v, par) => (v.length < par),
  uniqueItems: (v, par) => (par ? _.uniq(v).length < v.length : false),
  enum: (v, par) => (! par.has(v)),
  multipleOf: (v, par) => (v % par != 0),
}

let val_errors = {
  required: x => `This field is required.`,
  maximum: x => `Must not be more than ${x}.`,
  exclusiveMaximum: x => `Must be less than ${x}.`,
  minimum: x => `Must not be less than ${x}.`,
  exclusiveMinimum: x => `Must be more than ${x}.`,
  maxLength: x => `Must be within ${x} characters.`,
  minLength: x => `Must be at least ${x} characters.`,
  pattern: x => `Must match the regular expression (regex) pattern /<a href="https://regex101.com/?regex=${x}">${x}</a>/.`,
  maxItems: x => `Must have at most ${x} items.`,
  minItems: x => `Must have at least ${x} items.`,
  uniqueItems: x => `All items must be unique.`,
  enum: x => `Must be one of the following values: ${JSON.stringify(x)}.`,
  multipleOf: x => `Must be a multiple of ${x}.`,
}

// mime types: http://camendesign.com/code/uth4_mime-type/mime-types.php
// http headers: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpheaders.js
// http status codes: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpstatuscodes.js
// async validators: https://medium.com/@daviddentoom/angular-2-form-validation-9b26f73fcb81

export { parseVal, method_form, get_submit, Templates };
