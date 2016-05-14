let _ = require('lodash/fp');
let marked = require('marked');
import { Control, ControlGroup, ControlArray, AbstractControl } from '@angular/common';
import { ControlList, ControlVector, ControlObject, ControlObjectKvPair, ControlStruct, ControlSet } from './controls';
import { getPaths } from '../slim';
import { validate, get_validator } from './validators';
import { arr2obj, editValsOriginal } from '../../lib/js';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';

// get the default value for a value type
function type_default(type: string): any {
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

function get_default(spec: Front.Spec): any {
  let def = spec.default;
  return (!_.isUndefined(def)) ? def : type_default(spec.type);
}

// get the input type for a value type
let input_type = (type: string) => _.get([type], {
  string: 'text',
  number: 'number',
  integer: 'number',
  boolean: 'checkbox',
  file: 'file',
}) || type;

// pick a Jade template
export function get_template(spec: Front.Spec, attrs: Front.IAttributes): string|void {
  return _.get([spec.type], {
    //enum: white-listed values (esp. for string) -- in this case make scalars like radioboxes/drop-downs for input, or checkboxes for enum'd string[].
    // string: spec.enum ? (attrs.exclusive ? 'select' : 'datalist') : null,
    string: _.size(attrs.suggestions) ? 'datalist' : _.size(spec.enum) ? 'select' : null,
    // string: _.size(attrs.suggestions) ? 'datalist' : _.size(spec.enum) ? 'radio' : null,
    // ^ radio over select? alt. autocomplete over datalist?
    integer: (attrs.max && attrs.min && attrs.max > attrs.min) ? 'range' : null,
    // number: null,
    boolean: 'switch',
    date: 'date',
    file: 'file',
    // array: spec.uniqueItems && _.size(spec.enum) ? 'checkboxes' : null,
    // how to trigger, since only `input-field` runs by here?
    // ^ I'll assume `enum` implies scalar (checking in the face of *Of may be hard); otherwise how could I visualize?
    // object: [fieldset],
  }) || 'input';
}

// return the default value + validator for a spec
function vldtrDefPair(spec: Front.Spec): Front.IVldtrDef {
  return {
    val: get_default(spec),
    vldtr: get_validator(spec),
  };
}

// map a spec's subspecs given a lambda
export function mapSpec<T,U>(fn: (T) => U): Front.IObjectSpec<(T) => U> {
  return editValsOriginal({
    properties: _.mapValues(fn),
    patternProperties: _.mapValues(fn),
    additionalProperties: fn,
  });
}

// get a struct of validator-default pairs of a spec
// : Front.IObjectSpec<(Front.Spec) => Front.IVldtrDef>
export let getValStruct = mapSpec(vldtrDefPair);

// `ControlObject` generator (kicked out of `input_control`)
export function objectControl(spec: Front.Spec, doSeed: boolean = false): ControlObject {
  let ctrl = new ControlObject();
  if(doSeed) {
    // let allOf = _.get(['additionalProperties','allOf'], spec) || [];
    let valStruct = getValStruct(spec);
    let seed = () => new ControlObjectKvPair(valStruct);
    ctrl.init(seed); //, allOf
  }
  return ctrl;
}

// return initial key/value pair for the model
export function input_control(spec: Front.Spec = {}, asFactory = false): AbstractControl | Front.CtrlFactory {
  let factory, seed;  //, allOf
  switch(spec.type) {
    case 'array':
      // allOf = _.get(['items','allOf'], spec) || []; // oneOf is covered in the UI
      // only tablize predictable collections
      let props = _.get(['items','properties'], spec);
      if(_.isArray(spec.items)) {
        // let seeds = spec.items.map(x => input_control(x, true));
        // let add = spec.additionalItems;
        // let fallback = _.isPlainObject(add) ?
        //     input_control(add, true) :
        //     add == true ?
        //         input_control({}, true) :
        //         false;
        factory = () => new ControlVector() //.init(seeds, fallback); //, allOf
        // ^ ControlVector could also handle the simpler case below.
      } else if(spec.uniqueItems && _.size(spec.enum)) {
        factory = () => new ControlSet();
      } else {
        // let seed = props ?
        //     () => new ControlGroup(_.mapValues(x => input_control(x), props)) :
        //     input_control(spec.items, true);
        factory = () => new ControlList() //.init(seed);  //, allOf
      }
      break;
    case 'object':
      // allOf = _.get(['additionalProperties','allOf'], spec) || [];
      // let factStruct = mapSpec(x => input_control(x, true))(spec);
      factory = () => new ControlStruct() //.init(factStruct, spec.required || []);   //, allOf
      break;
    default:
      let val = get_default(spec);
      let validator = get_validator(spec);
      factory = () => new Control(val, validator); //, async_validator
  }
  return asFactory ? factory : factory();
}

const MAX_ITEMS = _.toLength(Infinity); // Math.pow(2, 32) - 1 // 4294967295

// get the html attributes for a given parameter/input
// http://swagger.io/specification/#parameterObject
export function input_attrs(path: Front.Path, spec: Front.Spec): Front.IAttributes {
  // general parameters
  // // workaround for Sweet, which does not yet support aliased destructuring: `not implemented yet for: BindingPropertyProperty`
  // let kind = spec.in || '';
  // let desc = spec.description || '';
  // let req = spec.required || false;
  // let allow_empty = spec.allowEmptyValue || false;
  // let def = spec.default || null;
  // let inc_max = spec.maximum || Number.MAX_VALUE;
  // let ex_max = spec.exclusiveMaximum || false;
  // let inc_min = spec.minimum || Number.MIN_VALUE;
  // let ex_min = spec.exclusiveMinimum || false;
  // let enum_options = spec.enum || null;
  // let {
  //   name = '',
  //   // in: kind = '',
  //   // description: desc = '',
  //   // required: req = false,
  //   schema = {},
  //   type = 'string',
  //   format = '',
  //   // allowEmptyValue: allow_empty = false,
  //   items = {},
  //   collectionFormat = 'csv',
  //   // default: def = null,
  //   // maximum: inc_max = Number.MAX_VALUE,
  //   // exclusiveMaximum: ex_max = false,
  //   // minimum: inc_min = Number.MIN_VALUE,
  //   // exclusiveMinimum: ex_min = false,
  //   pattern = '.*',
  //   minLength = 0,
  //   maxLength = 9007199254740991, //Math.pow(2, 53) - 1
  //   maxItems = MAX_ITEMS,
  //   minItems = 0,
  //   maxProperties = MAX_ITEMS,
  //   minProperties = 0,
  //   uniqueItems = false,
  //   // exclusive = false,
  //   suggestions = [],
  //   // enum: enum_options = null,
  //   multipleOf = 1,
  // } = spec;
  let { name, in: kind, description: desc, required: req, schema, type, format, allowEmptyValue: allow_empty, items, collectionFormat, default: def, maximum: inc_max, exclusiveMaximum: ex_max, minimum: inc_min, exclusiveMinimum: ex_min, pattern, minLength, maxLength, maxItems, minItems, maxProperties, minProperties, uniqueItems, exclusive, suggestions, enum: enum_options, multipleOf, } = spec;
  desc = marked(desc || '') //.stripOuter();
  let { id } = getPaths(path);  //, k, variable, model: elvis
  let key = name;  // variable
  let model = `form.controls.${key}`;
  let attrs = {
    // '[(ngModel)]': `${model}.value`,
    // ngControl: key,
    id,
    required: req,
    // exclusive, // used in input-object's `x-keys`
    suggestions,
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
      // int32, int64, float, double, byte, binary, date, date-time, password, hostname, ipv4, ipv6, uri; any other like email, uuid, ...
      let INPUT_TYPES = ['button', 'checkbox', 'color', 'date', 'datetime', 'datetime-local', 'email', 'file', 'hidden', 'image',
              'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'];
      if(format == 'date-time') format = 'datetime';
      if(INPUT_TYPES.includes(format)) type = format;
      // if(enum_options && !pattern) pattern = enum_options.map(_.escapeRegExp).join('|');
      break;
    // case 'array':
    // parameters: items, collectionFormat:csv(/ssv/tsv/pipes/multi), maxItems, minItems, uniqueItems
    // case 'object':
    // parameters: maxProperties, minProperties
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
  return _.pickBy(_.negate(_.isNil))(attrs);
}

// key uniqueness validator for ControlObject
export function uniqueKeys(name_lens: (AbstractControl) => string): ValidatorFn {
  return (ctrl: AbstractControl) => {
    let names = name_lens(ctrl);
    let valid = names.length == _.uniq(names).length;
    return valid ? null : { uniqueKeys: true };
  };
}

// calculate the different specs for key input controls, plus enum/suggestion options
// any spec-like object will do for the param, since only keys are checked.
export function getOptsNameSpecs(specLike: Front.IObjectSpec<any>): Object {
  let { properties: props, patternProperties: patterns, additionalProperties: add } = specLike;
  let [fixed, patts] = [props, patterns].map(_.keys);
  let categorizer = categorizeKeys(patts, fixed);
  let sugg = categorizer(_.get(['x-keys', 'suggestions'], specLike) || []);
  let { rest: addSugg, patts: pattSugg } = categorizer(_.get(['x-keys', 'suggestions'], specLike) || []);
  let { rest: addEnum, patts: pattEnum } = categorizer(_.get(['x-keys', 'enum'], specLike) || []);
  let nameSpec = { name: 'name', type: 'string', required: true };
  let nameSpecFixed = _.assign(nameSpec, { enum: fixed });
  let nameSpecPatt = arr2obj(patts, patt => _.assign(nameSpec, { enum: pattEnum[patt], suggestions: pattSugg[patt] }));
  let nameSpecAdd = _.assign(nameSpec, { enum: addEnum, suggestions: addSugg, not: { anyOf: patts.map(patt => ({ pattern: patt })).concat({ enum: fixed }) } });
  return { nameSpecFixed, nameSpecPatt, nameSpecAdd, addSugg, pattSugg, addEnum, pattEnum };
};

// categorize keys to a pattern or additional
export function categorizeKeys(patterns, blacklist = []): (keys: string[]) => { rest: string, patts: {[key: string]: string} } {
  return (keys: string[]) => {
    let r = _.difference(keys, blacklist);
    let sorter = v => _.find(patt => new RegExp(patt).test(v))(patterns);
    // let { undefined: rest, ...patts } = _.groupBy(sorter)(r); // without TS
    let grouped = _.groupBy(sorter)(r);
    let rest = grouped.undefined;
    let patts = _.omit('undefined')(grouped);
    return { rest, patts };
  };
}
