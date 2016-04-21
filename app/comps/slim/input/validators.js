let _ = require('lodash/fp');
import { Validators } from 'angular2/common';
import { arr2obj, mapBoth } from '../../lib/js';

const val_conds = {
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
  maxProperties: (v, par) => (Object.keys(v).length > par),
  minProperties: (v, par) => (Object.keys(v).length < par),
  uniqueItems: (v, par) => (par ? _.uniq(v).length < v.length : false),
  enum: (v, par) => (! par.includes(v)),
  multipleOf: (v, par) => (v % par != 0),
  type: (v, par) => !matchesType(v, par),
  not: (v, par) => !_.some(k => val_conds(v, par[k]))(Object.keys(par)),
}

const val_fns = mapBoth(val_conds, (fn, k) => (par) => (c) => par != null && fn(c.value, par) ? _.fromPairs([[k, true]]) : null); // { [k]: true }
// ... Object.keys(val_conds).map((k) => ... val_conds[k] ...
const ng_validators = _.assign(Validators, val_fns);

function matchesType(val, type) {
  const mapping = {
    array: v => _.isArray(v),
    object: v => _.isObject(v) && !_.isArray(v),
    integer: v => _.isNumber(v) && v % 1 == 0,
    number: v => _.isNumber(v),
    string: v => _.isString(v),
    null: v => _.isNull(v),
    boolean: v => _.isBoolean(v),
    any: v => true,
  };
  return _.isString(type) ? mapping[type](val) :
    _.isObject(type) ?
      _.get(['anyOf'], type) ? _.some(tp => matchesType(val, tp))(type.anyOf) :
      _.get(['oneOf'], type) ? _.some(tp => matchesType(val, tp))(type.oneOf) :
      _.get(['allOf'], type) ? _.every(tp => matchesType(val, tp))(type.allOf) :
      false : // throw `bad type (object): ${type}`
    false; // throw `bad type (?): ${type}`
}

export const val_errors = {
  required: x => v => `This field is required.`,
  maximum: x => v => `Must not be more than ${x}.`,
  exclusiveMaximum: x => v => `Must be less than ${x}.`,
  minimum: x => v => `Must not be less than ${x}.`,
  exclusiveMinimum: x => v => `Must be more than ${x}.`,
  maxLength: x => v => `Too many characters: ${_.get(['length'], v)}/${x}.`,
  minLength: x => v => `Not enough characters: ${_.get(['length'], v)}/${x}.`,
  pattern: x => v => {
    let patt = `^${x}$`;  //.replace(/\\/g, '\\\\')
    // return `Must match the regular expression (regex) pattern /<a href="https://regex101.com/?regex=${patt}">${patt}</a>/.`;
    let str = `Must match the regular expression (regex) pattern /<a href="https://regex101.com/?regex=${patt}">${patt}</a>/.`;
    return str;
  },
  maxItems: x => v => `Too many items: ${_.get(['length'], v)}/${x}.`,
  minItems: x => v => `Not enough items: ${_.get(['length'], v)}/${x}.`,
  maxProperties: x => v => `Too many properties: ${Object.keys(v).length}/${x}.`,
  minProperties: x => v => `Not enough properties: ${Object.keys(v).length}/${x}.`,
  uniqueItems: x => v => `All items must be unique.`,
  // uniqueKeys: x => v => `All keys must be unique.`,
  // enum: x => v => `Must be one of the following values: ${JSON.stringify(x)}.`,
  enum: x => v => {
    let json = JSON.stringify(x);
    // return `Must be one of the following values: ${json}.`;
    let str = `Must be one of the following values: ${json}.`;
    return str;
  },
  multipleOf: x => v => `Must be a multiple of ${x}.`,
  type: x => v => `Should match type ${JSON.stringify(x)}.`,
  not: x => v => `Should not match spec ${JSON.stringify(x)}.`,
};

export const val_keys = Object.keys(val_errors);

// prepare the form control validators
export let get_validator = (spec) => {
  const ofs = ['anyOf','oneOf','allOf'];
  let of_vals = ofs.reduce((acc, k) => acc.concat(_.get([k], spec) || []), []).map(opt => get_validator(opt));
  let of_vldtr = (c) => _.some(x => !x)(of_vals.map(opt => opt.validator));
  let used_vals = val_keys.filter(k => spec[k] != null);
  let validators = used_vals.map(k => ng_validators[k](spec[k])).concat(of_vldtr);
  return Validators.compose(validators);
}

// async validators: https://medium.com/@daviddentoom/angular-2-form-validation-9b26f73fcb81
