let _ = require('lodash/fp');
let marked = require('marked');
import { Control, ControlGroup, ControlArray } from 'angular2/common';
import { ControlList } from './control_list';
import { ControlObject } from './control_object';
import { getPaths } from '../slim';
import { get_validator } from './validators';
import { ControlObjectKvPair } from './control_object_kv_pair';

// get the default value for a value type
let type_default = (type) => {
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

let get_default = (spec) => {
  let def = spec.default;
  return (!_.isUndefined(def)) ? def : type_default(spec.type);
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
export let get_template = (spec, attrs) => {
  return _.get([spec.type], {
    //enum: white-listed values (esp. for string) -- in this case make scalars like radioboxes/drop-downs for input, or checkboxes for enum'd string[].
    string: spec.enum ? (attrs.exclusive ? 'select' : 'datalist') : null, //radio over select? alt. autocomplete over datalist?
    integer: (attrs.max > attrs.min && attrs.min > Number.MIN_VALUE && attrs.max > Number.MAX_VALUE) ? 'range' : null,
    boolean: 'switch',
    date: 'date',
    file: 'file',
    // number: null,
    // array: [checkboxes, array],
    // object: [fieldset],
  }) || 'input';
}

// return the default value + validator for a spec
let vldtrDefPair = (spec) => ({
  val: get_default(spec),
  vldtr: get_validator(spec),
})

// generature a default-validator pair structure from a spec
export let getValStruct = (spec) => ({
  properties: _.mapValues(vldtrDefPair)(spec.properties || {}),
  patternProperties: _.mapValues(vldtrDefPair)(spec.patternProperties || {}),
  additionalProperties: vldtrDefPair(spec.additionalProperties || {}),
});

// return initial key/value pair for the model
export function input_control(spec = {}, asFactory = false) {
  let factory;
  switch(spec.type) {
    case 'array':
      let arrAllOf = _.get(['items','allOf'], spec) || []; // oneOf is covered in the UI
      let props = _.get(['items','properties'], spec);
      let ctrlFactory = props ?
        () => new ControlGroup(_.mapValues(x => input_control(x), props)) :
        input_control(spec.items, true);
      factory = () => new ControlList(ctrlFactory, arrAllOf);
      break;
    case 'object':
      let objAllOf = _.get(['additionalProperties','allOf'], spec) || [];
      // let grp = new ControlGroup({name, val});
      let valStruct = getValStruct(spec);
      let grpFactory = () => new ControlObjectKvPair(valStruct);
      factory = () => new ControlObject(grpFactory, objAllOf);
      break;
    default:
      let val = get_default(spec);
      let validator = get_validator(spec);
      factory = () => new Control(val, validator); //, async_validator
  }
  return asFactory ? factory : factory();
}

// get the html attributes for a given parameter/input
// http://swagger.io/specification/#parameterObject
export let input_attrs = (path, spec) => {
  // general parameters
  // workaround for Sweet, which does not yet support aliased destructuring: `not implemented yet for: BindingPropertyProperty`
  let kind = spec.in || '';
  let desc = spec.description || '';
  let req = spec.required || false;
  let allow_empty = spec.allowEmptyValue || false;
  let def = spec.default || null;
  let inc_max = spec.maximum || Number.MAX_VALUE;
  let ex_max = spec.exclusiveMaximum || false;
  let inc_min = spec.minimum || Number.MIN_VALUE;
  let ex_min = spec.exclusiveMinimum || false;
  let enum_options = spec.enum || null;
  let {
    name = '',
    // in: kind = '',
    // description: desc = '',
    // required: req = false,
    schema = {},
    type = 'string',
    format = '',
    // allowEmptyValue: allow_empty = false,
    items = {},
    collectionFormat = 'csv',
    // default: def = null,
    // maximum: inc_max = Number.MAX_VALUE,
    // exclusiveMaximum: ex_max = false,
    // minimum: inc_min = Number.MIN_VALUE,
    // exclusiveMinimum: ex_min = false,
    pattern = '.*',
    minLength = 0,
    maxLength = 9007199254740991, //Math.pow(2, 53) - 1
    maxItems = 4294967295,  //Math.pow(2, 32) - 1
    minItems = 0,
    uniqueItems = false,
    exclusive = false,
    // enum: enum_options = null,
    multipleOf = 1,
  } = spec;
  desc = marked(desc || '') //.stripOuter();
  let { id } = getPaths(path);  //, k, variable, model: elvis
  let key = name;  // variable
  let model = `form.controls.${key}`;
  let attrs = {
    '[(ngModel)]': `${model}.value`,
    ngControl: key,
    id,
    required: req,
    exclusive, // used in input-object's `x-keys`
  };
  // if(desc) attrs.placeholder = description;
  // attrs[`#${variable}`] = 'ngForm';

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
      // if(enum_options && !pattern) pattern = enum_options.map(s => RegExp_escape(s)).join('|');
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
      pattern,
      // title: 'title test', //used in browser's native (ugly) tooltip and 'required' popup. what of ng-aria?
      'data-tooltip': desc,
      autocomplete: AUTO_COMP.includes(name) ? name : 'on', //off
    },
    number: {
      max,
      min,
      step: multipleOf,
    },
    integer: {
      max,
      min,
      step: multipleOf || 1,
    },
  }
  let extra = _.get([type], type_params) || {};
  Object.assign(attrs, extra);
  attrs.type = input_type(type);
  return attrs;
}

export let allUsed = (allOf, get_lens = y => y) => (ctrl) => {
  let vals = ctrl.controls.map(x => get_lens(x.value));
  // ideally it should validate as long as all types are used even without values, but this may
  // require checking from input-array/-object by asking their `input-field`s through a QueryList...
  let valid = _.every(spec => _.some(v => tv4.validate(v, spec, false, false, false))(vals))(allOf);
  return valid ? null : {allOf: true};
};
