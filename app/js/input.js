let _ = require('lodash');
let marked = require('marked');
import { Array_last, Array_has, Array_clean, Array_flatten, Object_filter, RegExp_escape, arr2obj, toast, mapBoth, String_stripOuter, getPaths, id_cleanse } from './js.js'; //, Obs_do, Obs_then
import { Validators, Control } from 'angular2/common';
import { Templates } from './jade';

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
  //enum: white-listed values (esp. for string) -- in this case make scalars like radioboxes/drop-downs for input, or checkboxes for enum'd string[].
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
      if(allow_empty) minLength = 0
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

// async validators: https://medium.com/@daviddentoom/angular-2-form-validation-9b26f73fcb81

export { method_form };
