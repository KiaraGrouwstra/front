let marked = require('marked');
let _ = require('lodash/fp');
import { Array_last, Array_has, Array_clean, Array_flatten, Object_filter, RegExp_escape, arr2obj, toast, mapBoth, String_stripOuter, getPaths, id_cleanse } from './js.js'; //, Obs_do, Obs_then
import { Validators, Control, ControlGroup, ControlArray } from 'angular2/common';
import { Templates } from './jade';
import { ControlList } from './control_list';
import { ControlObject } from './control_object';

// get the default value for a value type
let get_default = (type) => {
  let def_vals = {
    string: '',
    number: 0,
    integer: 0,
    boolean: false,
    array: [],
    object: {},
    // file: 'file', //[],
  }
  return _.get([type], def_vals)
}

// get the input type for a value type
let input_type = (type) => _.get([type], {
  string: 'text',
  number: 'number',
  integer: 'number',
  boolean: 'checkbox',
  file: 'file',
}) || type;

// pick a Jade template
let get_template = (opts) => _.get([opts.type], {
  //enum: white-listed values (esp. for string) -- in this case make scalars like radioboxes/drop-downs for input, or checkboxes for enum'd string[].
  string: opts.enum_opts ? 'datalist' : null, //select, radio
  integer: (opts.attrs.max > opts.attrs.min) ? 'range' : null,
  boolean: 'switch',
  date: 'date',
  // number: null,
  // array: [checkboxes, array],
  // object: [fieldset],
}) || 'input'

// get the html attributes for a given parameter/input
// http://swagger.io/specification/#parameterObject
let input_attrs = (path, spec) => {
  // general parameters
  let { name: name, in: kind, description: desc, required: req, schema: schema, type: type, format: format, allowEmptyValue: allow_empty, items: items, collectionFormat: collectionFormat, default: def, maximum: inc_max, exclusiveMaximum: ex_max, minimum: inc_min, exclusiveMinimum: ex_min, maxLength: maxLength, minLength: minLength, pattern: pattern, maxItems: maxItems, minItems: minItems, uniqueItems: uniqueItems, enum: enum_options, multipleOf: multipleOf } = spec;
  desc = marked(desc || '') //.stripOuter();
  let { id: id, variable: variable } = getPaths(path);  //, k: k, model: elvis
  let key = name;  // variable
  let model = `form.controls.${key}`;
  let attrs = {
    '[(ngModel)]': `${model}.value`,
    ngControl: key,
    id: id,
    required: req,
  };
  // if(desc) marked)(attrs.placeholder = description;;
  attrs[`#${variable}`] = 'ngForm';

  // numbers:
  let max = inc_max || ex_max ? ex_max + 1 : null;
  let min = inc_min || ex_min ? ex_min - 1 : null;

  // type-specific parameter edits
  switch(type) {
    case 'string':
      // parameters: allowEmptyValue:false, maxLength, minLength, pattern, format
      if(allow_empty) minLength = 0;
      // format: http://swagger.io/specification/#dataTypeFormat
      // int32, int64, float, double, byte, binary, date, date-time, password; any other like email, uuid, ...
      let INPUT_TYPES = ['button', 'checkbox', 'color', 'date', 'datetime', 'datetime-local', 'email', 'file', 'hidden', 'image',
              'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'];
      if(format == 'date-time') format = 'datetime';
      if(INPUT_TYPES.includes(format)) type = format;
      if(enum_options && !pattern) pattern = enum_options.map(s => RegExp_escape(s)).join('|');
      break;
    // case 'array':
    // parameters: items, collectionFormat:csv(/ssv/tsv/pipes/multi), maxItems, minItems, uniqueItems
    //   break;
  }

  let AUTO_COMP = ['name', 'honorific-prefix', 'given-name', 'additional-name', 'family-name', 'honorific-suffix', 'nickname', 'email', 'username', 'new-password', 'current-password', 'organization-title', 'organization', 'street-address', 'address-line1', 'address-line2', 'address-line3', 'address-level4', 'address-level3', 'address-level2', 'address-level1', 'country', 'country-name', 'postal-code', 'cc-name', 'cc-given-name', 'cc-additional-name', 'cc-family-name', 'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type', 'transaction-currency', 'transaction-amount', 'language', 'bday', 'bday-day', 'bday-month', 'bday-year', 'sex', 'tel', 'url', 'photo'];

  // type-specific parameters
  let type_params = {
    string: {
      maxlength: maxLength,
      minlength: minLength,
      pattern: pattern,
      // title: 'title test', //used in browser's native (ugly) tooltip and 'required' popup. what of ng-aria?
      'data-tooltip': desc,
      autocomplete: AUTO_COMP.includes(name) ? name : 'on', //off
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
  let extra = _.get([type], type_params) || {};
  Object.assign(attrs, extra);
  attrs.type = input_type(type);
  return attrs;
}

let input_opts = (spec, attrs, val_msgs) => ({  //path, attrs = input_attrs(path, spec), val_msgs = get_validators(spec).val_msgs
  attrs: attrs,
  type: spec.type,
  enum_opts: spec.enum,
  id: attrs.id,
  ctrl: `form.controls.${spec.name}`,
  label: marked(`**${spec.name}:** ${spec.description}`),
  validators: val_msgs,
  hidden: spec.type == 'hidden',
})

// get the input template for a given parameter
// http://swagger.io/specification/#parameterObject
let param_field = (path, spec) => {
  let { validator: validator, val_msgs: val_msgs } = get_validators(spec);
  let attrs = input_attrs(path, spec);
  let opts = input_opts(spec, attrs, val_msgs); //path,
  // get the html template for the given settings
  let template = Templates[get_template(opts)];
  let field = template(opts);

  // return the html along with its initial key/value pair for the model
  let ctrl = input_control(spec, validator);
  let obj = { [spec.name]: { type: spec.in, val: ctrl } };
  return { html: field, obj: obj };
}

// return initial key/value pair for the model
function input_control(spec = {}, validator = get_validators(spec).validator) {
  switch(spec.type) {
    case 'array':
      return _.get(['items','properties'], spec) ?
      new ControlList(new ControlGroup(_.mapValues(prop => input_control(prop), spec.items.properties))) :  // table, not native Swagger
      new ControlList(input_control(spec.items));
    case 'object':  // not native Swagger
      let pattern = '[\\w_][\\w_\\d]*'; // escaped cuz string; also, this gets used yet the one in object.jade is displayed in the error
      let ctrl = input_control({name: 'name', type: 'string', required: true, pattern: pattern});
      return new ControlObject(new ControlGroup({name: ctrl, val: input_control(spec.additionalProperties)}));
    default:
      let def = spec.default;
      let val = (typeof def !== 'undefined') ? def : get_default(spec.type);
      return new Control(val, validator); //, async_validator
      // return [val, validator];
  }
}

// get a form template
// let make_form = (input_pars, desc = '', tmplt = Templates.form) => {
//   let fields = input_pars.map(par => param_field(par.path, par.spec));
//   let html = tmplt({ desc: desc, fields: fields.map(x => x.html) });
//   let obj = fields.length ? Object.assign(...fields.map(x => x.obj)) : {};
//   return { html: html, obj: obj };
// }

// use to map an array of input specs to a version with path added
let input_specs = (path = []) => (v, idx) => ({ path: path.concat(_.get('name')(v) || idx), spec: v })

// pars to make a form for a given API function
let method_pars = (spec, fn_path) => {
  // I'd consider json path, but [one implementation](https://github.com/flitbit/json-path) needs escaping
  // [the other](https://github.com/s3u/JSONPath/) uses async callbacks...
  // http://jsonpath.com/ -> $.paths./geographies/{geo-id}/media/recent.get.parameters
  let hops = ['paths', fn_path, 'get', 'parameters'];
  let path = hops.map(x => id_cleanse(x));
  let scheme = { path: ['schemes'], spec: {name: 'uri_scheme', in: 'path', description: 'The URI scheme to be used for the request.', required: true, type: 'hidden', allowEmptyValue: false, default: spec.schemes[0], enum: spec.schemes}};
  let input_pars = [scheme].concat((_.get(hops, spec) || []).map(input_specs(path)));
  let desc = marked(_.get(_.dropRight(hops, 1).concat('description'))(spec) || '');
  return { pars: input_pars, desc: desc };
}

// form for a given API function
// let method_form = (spec, fn_path, tmplt = Templates.form) => {
//   let { pars: pars, desc: desc } = method_pars(spec, fn_path);
//   return make_form(pars, desc, tmplt);
// }

// validators

// prepare the form control validators
let get_validators = (spec) => {
  let val_fns = mapBoth(val_conds, (fn, k) => (par) => (c) => fn(c.value, par) ? { [k]: true } : null);
  Object.assign(Validators, val_fns);
  // 'schema', 'format', 'items', 'collectionFormat', 'type'
  let val_keys = ['required', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems', 'minItems', 'uniqueItems', 'enum', 'multipleOf'];
  let used_vals = val_keys.filter(k => spec[k] != null);
  let validators = used_vals.map(k => Validators[k](spec[k]));
  let validator = Validators.compose(validators);
  let val_msgs = arr2obj(used_vals, k => val_errors[k](spec[k]));
  return { validator: validator, val_msgs: val_msgs };
}

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
  pattern: (v, par) => (! new RegExp(`^${par}$`).test(v)),  //escape pattern backslashes? // alt: [Validators.pattern](https://github.com/angular/angular/commit/38cb526)
  maxItems: (v, par) => (v.length > par),
  minItems: (v, par) => (v.length < par),
  uniqueItems: (v, par) => (par ? _.uniq(v).length < v.length : false),
  enum: (v, par) => (! par.includes(v)),
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
  pattern: x => {
    let patt = `^${x}$`;  //.replace(/\\/g, '\\\\')
    return `Must match the regular expression (regex) pattern /<a href="https://regex101.com/?regex=${patt}">${patt}</a>/.`;
  },
  maxItems: x => `Must have at most ${x} items.`,
  minItems: x => `Must have at least ${x} items.`,
  uniqueItems: x => `All items must be unique.`,
  enum: x => `Must be one of the following values: ${JSON.stringify(x)}.`,
  multipleOf: x => `Must be a multiple of ${x}.`,
}

// async validators: https://medium.com/@daviddentoom/angular-2-form-validation-9b26f73fcb81

// [ng1 material components](https://github.com/Textalk/angular-schema-form-material/tree/develop/src)
// [type map](https://github.com/Textalk/angular-schema-form/blob/development/src/services/schema-form.js#L233)
// [swagger editor ng1 html](https://github.com/swagger-api/swagger-editor/blob/master/app/templates/operation.html)
// json editor:
// - functional [elements](https://github.com/flibbertigibbet/json-editor/blob/develop/src/theme.js)
// - [overrides](https://github.com/flibbertigibbet/json-editor/blob/develop/src/themes/bootstrap3.js)

export { method_pars, input_attrs, input_control, get_validators, input_opts, get_template, input_specs }; //, method_form, make_form
