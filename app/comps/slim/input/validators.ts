let _ = require('lodash/fp');
import { Validators } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { arr2obj, mapBoth } from '../../lib/js';

// tv4: https://github.com/geraintluff/tv4
// json-editor: https://github.com/jdorn/json-editor/blob/master/src/validator.js
const valConds: {[key: string]: (v: any, par: any) => boolean} = {
  // schema: (v, par) => (v, par),
  // collectionFormat: (v, par) => (v, par),
  required: // assumes string?
      (v, par) => v.length,
  maximum:
      (v, par) => (v <= par),
  exclusiveMaximum:
      (v, par) => (v < par),
  minimum:
      (v, par) => (v >= par),
  exclusiveMinimum:
      (v, par) => (v > par),
  maxLength: //predefined
      (v, par) => (v.length <= par),
  minLength: //predefined
      (v, par) => (v.length >= par),
  pattern:
      (v, par) => new RegExp(`^${par}$`).test(v),
      // ^ escape pattern backslashes?
      // alt: [Validators.pattern](https://github.com/angular/angular/commit/38cb526)
  maxItems:
      (v, par) => (v.length <= par),
  minItems:
      (v, par) => (v.length >= par),
  maxProperties:
      (v, par) => (_.size(v) <= par),
  minProperties:
      (v, par) => (_.size(v) >= par),
  uniqueItems:
      (v, par) => (!par || _.uniq(v).length == v.length),
  enum:
      (v, par) => par.includes(v),
      // actually different for array, which has to iterate, see ControlSet
  multipleOf:
      (v, par) => (v % par == 0),
  type:
      (v, par) => matchesType(v, par),
  not:
      (v, par) => !validate(v, par),
  items:
      (v, par) => _.isArray(par) ?
        _.zip(v, par).every(([val, schema]) =>
          [val, schema].some(_.isUndefined) || validate(val, schema)
        ) :
            v.every(x => validate(x, par)),
  properties:
      (v, par) => _.keys(par).every(k => validate(v[k], par[k])),
  patternProperties:
      (v, par) => _.keys(par).every(patt => _.keys(v)
        .filter(k => new RegExp(patt).test(k))
        .every(k => validate(v[k], par[k]))
      ),
  anyOf:
      (v, par) => par.some(x => validate(v, x)),
  allOf:
      (v, par) => par.every(x => validate(v, x)),
  oneOf:
      (v, par) => _.sum(par.map(x => validate(v, x))) == 1,
  additionalItems:
      (v, par, schema) => v.slice(schema.items.length).every(
        val => _.isObject(par) ? validate(val, par) : par
      ),
  additionalProperties:
      (v, par, schema) => {
        let specKeys = _.keys(schema.patternProperties)).concat(_.keys(schema.properties);
        let keysBySpec = _.flatMap(patt => _.keys(v).filter(
          k => new RegExp(patt).test(k))
        )(specKeys);
        let restKeys = _.difference(_.keys(v), keysBySpec);
        return restKeys.every(val => validate(val, par));
      },
  format:
      (v, par) => validateFormat(v, par),
};

function isNBit(n: number): boolean {
  let x = Math.pow(2,n-1);
  return _.inRange(-x, x-1);
}

export const formatMap = {
  // [json-schema](https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-7)
  'date-time':
      v => !isNaN(Date.parse(v)),
  email:
      /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  hostname:
      /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/,
      // naive: http://stackoverflow.com/questions/106179/
  uri:
      /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/,
  ipv4:
      /^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/,
  ipv6:
      /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/,
  // [open-api](http://swagger.io/specification/#dataTypeFormat)
  int32:
      isNBit(32),
  int64:
      isNBit(64),
  // float: v => matchesType(v, 'number'),
  // double: v => matchesType(v, 'number'),
  byte:
      /[\dA-Za-z\+\/\=]*/,
  binary:
      /[\dA-Fa-f]*/,
  date:
      v => !isNaN(Date.parse(v)),
  // password: , // no validation, just intended to switch to <input type='password'>
  // MISC:
  alpha:
      /^[a-zA-Z]+$/,
  alphanumeric:
      /^[a-zA-Z0-9]+$/,
  identifier:
      /^[-_a-zA-Z0-9]+$/,
  hexadecimal:
      /^[a-fA-F0-9]+$/,
  numeric:
      v => /^[0-9]+$/,
  uppercase:
      v => v === v.toUpperCase(),
  lowercase:
      v => v === v.toLowerCase(),
  url:
      /(http(s):\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
  uuid:
      /^(?:urn\:uuid\:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
  'json-pointer':
      /^(?:\/(?:[^~\/]|~0|~1)+)*(?:\/)?$|^\#(?:\/(?:[a-z0-9_\-\.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)+)*(?:\/)?$/i,
  'relative-json-pointer':
      /^(?:0|[1-9][0-9]*)(?:\#|(?:\/(?:[^~\/]|~0|~1)+)*(?:\/)?)$/,
  regex: v => {
    try {
      RegExp(v);
      return true;
    } catch (e) {
      return false;
    }
  },
};

// [ajv](https://github.com/epoberezkin/ajv/blob/master/lib/compile/formats.js)
export function validateFormat(val: any, format: string) {
  let vldtr = formatMap[format];
  return !vldtr ? true : _.isRegExp(vldtr) ? vldtr.test(val) : vldtr(val);
  // let INPUT_TYPES = ['button', 'checkbox', 'color', 'date', 'datetime', 'datetime-local', 'email', 'file', 'hidden', 'image',
  //        'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'
}

export const validate = (v: any, schema: Front.Schema): boolean =>
    !_.isNil(schema) && _.keys(schema)
    .every(k => {
      let fn = valConds[k];
      return fn ? fn(v, schema[k], schema) : true;
    })
// actually filter applicable keys by type: https://github.com/epoberezkin/ajv/blob/master/lib/compile/rules.js
// this way can also add implicit type-specific validators, e.g. `uniqueKeys` for object.
// should filter on value applied to; only works if the schema limits it to 1 `type`.
// solution: both filter by schema-type and do run-time checks (pass if wrong type) in validators?

const valFns: {[key: string]: (par: any) => ValidatorFn} =
  mapBoth(valConds, (fn, k) => (par) => (c) =>
  // mapBoth(valConds, _.curry((fn, k, par, c) =>
    par != null && !fn(c.value, par) ? _.fromPairs([[k, true]]) : null
    // { [k]: true }
  );
  // ));
// ... _.keys(valConds).map((k) => ... valConds[k] ...
// const ng_validators = _.assign(Validators, valFns);

function matchesType(val: any, type: string): boolean {
  const mapping = {
    array: _.isArray,
    object: _.isPlainObject,
    integer: v => v % 1 == 0,
    number: v => !isNaN(v),
    string: _.isString,
    null: _.isNull,
    boolean: _.isBoolean,
    any: v => true,
    // date: _.isDate,
  };
  const matches = (tp: string) => matchesType(val, tp);
  return _.isString(type) ? mapping[type](val) :
    _.isObject(type) ?
      _.has(['anyOf'], type) ? type.anyOf.some(matches) :
      _.has(['oneOf'], type) ? type.oneOf.some(matches) :
      _.has(['allOf'], type) ? type.allOf.every(matches) :
      false : // throw `bad type (object): ${type}`
    false; // throw `bad type (?): ${type}`
}

// tv4: https://github.com/geraintluff/tv4/blob/master/source/api.js
// json-editor: https://github.com/jdorn/json-editor/blob/master/src/defaults.js
// json-schema-form: https://github.com/json-schema-form/angular-schema-form/blob/development/src/services/errors.js
// [tests](https://github.com/jdorn/json-editor/blob/master/tests/validation.html)
// includes: dependencies, definitions, $ref, custom
// [z-schema](https://github.com/zaggino/z-schema/blob/master/src/Errors.js)
export const valErrors: {[key: string]: (x: any) => (v: any) => string} = {
  required: x => v => `This field is required.`,
  maximum: x => v => `Must not be more than ${x}.`,
  exclusiveMaximum: x => v => `Must be less than ${x}.`,
  minimum: x => v => `Must not be less than ${x}.`,
  exclusiveMinimum: x => v => `Must be more than ${x}.`,
  maxLength: x => v => `Too many characters: ${_.size(v)}/${x}.`,
  minLength: x => v => `Not enough characters: ${_.size(v)}/${x}.`,
  pattern: x => v => {
    let patt = `^${x}$`;  //.replace(/\\/g, '\\\\')
    // return `Must match the regular expression (regex) pattern /<a href="https://regex101.com/?regex=${patt}">${patt}</a>/.`;
    let str = `Must match the regular expression (regex) pattern /<a href="https://regex101.com/?regex=${patt}">${patt}</a>/.`;
    return str;
  },
  maxItems: x => v => `Too many items: ${_.size(v)}/${x}.`,
  minItems: x => v => `Not enough items: ${_.size(v)}/${x}.`,
  maxProperties: x => v => `Too many properties: ${_.size(v)}/${x}.`,
  minProperties: x => v => `Not enough properties: ${_.size(v)}/${x}.`,
  uniqueItems: x => v => `All items must be unique.`,
  uniqueKeys: x => v => `All keys must be unique.`,
  enum: x => v => `Must be one of the following values: ${JSON.stringify(x)}.`,
  // enum: x => v => {
  //   let json = JSON.stringify(x);
  //   // return `Must be one of the following values: ${json}.`;
  //   let str = `Must be one of the following values: ${json}.`;
  //   return str;
  // },
  multipleOf: x => v => `Must be a multiple of ${x}.`,
  type: x => v => `Should match type ${JSON.stringify(x)}.`,
  not: x => v => `Should not match schema ${JSON.stringify(x)}.`,
  items: x => v => `Items should match schema ${JSON.stringify(x)}.`,
  properties: x => v => `Properties should match schema ${JSON.stringify(x)}.`,
  patternProperties: x => v => `Pattern properties should match schema ${JSON.stringify(x)}.`,
  additionalItems: x => v => `Additional items should match schema ${JSON.stringify(x)}.`,
  additionalProperties: x => v => `Additional properties should match schema ${JSON.stringify(x)}.`,
  anyOf: x => v => `Should match any of schemas ${JSON.stringify(x)}.`,
  allOf: x => v => `Should match all of schemas ${JSON.stringify(x)}.`,
  oneOf: x => v => `Should match one of schemas ${JSON.stringify(x)}.`,
  format: x => v => `Should match format '${x}'.`,
};

export const VAL_KEYS: string[] = _.keys(valErrors);

// prepare the form control validators
export function getValidator(schema: Front.Schema): ValidatorFn {
  const ofs = ['anyOf','oneOf','allOf'];
  let of_vals = ofs.reduce(
    (acc, k) => acc.concat(_.get([k], schema) || [])
  , []).map(opt => getValidator(opt));
  let of_vldtrs = of_vals.map(opt => opt.validator);
  let of_vldtr = (c) => of_vldtrs.some(x => !x);
  let used_vals = VAL_KEYS.filter(k => schema[k] != null);
  let validators = used_vals.map(k => valFns[k](schema[k])).concat(of_vldtr);
  return Validators.compose(validators);
}

// async validators: https://medium.com/@daviddentoom/angular-2-form-validation-9b26f73fcb81
