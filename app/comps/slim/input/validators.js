let _ = require('lodash/fp');
import { Validators } from 'angular2/common';
import { arr2obj, mapBoth } from '../../lib/js';

// prepare the form control validators
export let get_validators = (spec) => {
  const ofs = ['anyOf','oneOf','allOf'];
  let of_vals = ofs.reduce((acc, k) => acc.concat(_.get([k], spec) || []), []).map(opt => get_validators(opt));
  let of_vldtr = (c) => _.some(x => !x)(of_vals.map(opt => opt.validator));
  let val_fns = mapBoth(val_conds, (fn, k) => (par) => (c) => par != null && fn(c.value, par) ? _.fromPairs([[k, true]]) : null); // { [k]: true }
  // ... Object.keys(val_conds).map((k) => ... val_conds[k] ...
  Object.assign(Validators, val_fns);
  // 'schema', 'format', 'items', 'collectionFormat', 'type'
  let used_vals = val_keys.filter(k => spec[k] != null);
  let validators = used_vals.map(k => Validators[k](spec[k])).concat(of_vldtr);
  return Validators.compose(validators);
}

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
  uniqueItems: (v, par) => (par ? _.uniq(v).length < v.length : false),
  enum: (v, par) => (! par.includes(v)),
  multipleOf: (v, par) => (v % par != 0),
}

export const val_errors = {
  required: x => `This field is required.`,
  maximum: x => `Must not be more than ${x}.`,
  exclusiveMaximum: x => `Must be less than ${x}.`,
  minimum: x => `Must not be less than ${x}.`,
  exclusiveMinimum: x => `Must be more than ${x}.`,
  maxLength: x => `Must be within ${x} characters.`,
  minLength: x => `Must be at least ${x} characters.`,
  pattern: x => {
    let patt = `^${x}$`;  //.replace(/\\/g, '\\\\')
    // return `Must match the regular expression (regex) pattern /<a href="https://regex101.com/?regex=${patt}">${patt}</a>/.`;
    let str = `Must match the regular expression (regex) pattern /<a href="https://regex101.com/?regex=${patt}">${patt}</a>/.`;
    return str;
  },
  maxItems: x => `Must have at most ${x} items.`,
  minItems: x => `Must have at least ${x} items.`,
  uniqueItems: x => `All items must be unique.`,
  // uniqueKeys: x => `All keys must be unique.`,
  // enum: x => `Must be one of the following values: ${JSON.stringify(x)}.`,
  enum: x => {
    let json = JSON.stringify(x);
    // return `Must be one of the following values: ${json}.`;
    let str = `Must be one of the following values: ${json}.`;
    return str;
  },
  multipleOf: x => `Must be a multiple of ${x}.`,
};

export const val_keys = Object.keys(val_errors);

// async validators: https://medium.com/@daviddentoom/angular-2-form-validation-9b26f73fcb81
