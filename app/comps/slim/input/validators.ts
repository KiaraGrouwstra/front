let _ = require('lodash/fp');
import { Validators } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { arr2obj, mapBoth } from '../../lib/js';

// tv4: https://github.com/geraintluff/tv4
// json-editor: https://github.com/jdorn/json-editor/blob/master/src/validator.js
const valConds: {[key: string]: (v: any, par: any, schema: Front.Schema) => boolean} = {
  required: // object
      (v, par) => par.every(y => y in v),
  required_field: // custom, implicit on fields of `required` to localize error messages
      // must set `name`, pass schema. I now also set `required` prevent close buttons. :(
      (v, par, schema) => _.size(v) || !(par == true || par.includes(schema.name)),
  maximum:
      (v, par) => (Number(v) <= par),
  exclusiveMaximum:
      (v, par) => (Number(v) < par),
  minimum:
      (v, par) => (Number(v) >= par),
  exclusiveMinimum:
      (v, par) => (Number(v) > par),
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
      (v, par) => par.map(y => y.toString()).includes(v),
  multipleOf:
      (v, par) => (Number(v) % par == 0),
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
  additionalItems:
      (v, par, schema) => v.slice(schema.items.length).every(
        val => _.isObject(par) ? validate(val, par) : par
      ),
  properties:
      (v, par) => _.keys(par).every(k => validate(v[k], par[k])),
  patternProperties:
      (v, par) => _.keys(par).every(patt => _.keys(v)
        .filter(k => new RegExp(patt).test(k))
        .every(k => validate(v[k], par[k]))
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
  anyOf:
      (v, par) => par.some(x => validate(v, x)),
  allOf:
      (v, par) => par.every(x => validate(v, x)),
  oneOf:
      (v, par) => _.sum(par.map(x => validate(v, x))) == 1,
  format:
      (v, par) => validateFormat(v, par),
  $ref:
      (v, par) => false, // unimplemented here, expect $ref to be pre-resolved
  // part of OpenAPI instead of json-schema
  // schema: (v, par) => (v, par),
  // collectionFormat: (v, par) => (v, par),
  // custom
  // uniqueKeys: (v, par) => true, // fails, must check before serialization
  // // also need lens to keys (implementation-dependent), so got own function
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

// validate a value with a schema
export const validate = (v: any, schema: Front.Schema): boolean => {
  if(_.isNil(schema)) return true;
  let keys = relevantValidators(schema, VAL_FUN_KEYS);
  return keys.every(k => {
    let fn = valConds[k];
    return fn ? fn(v, schema[k], schema) : true;
  });
}

// give validator keys applicable to the top level of a schema
export function relevantValidators(schema: Front.Schema, whitelist: string[] = [], verbose: boolean = false): string[] {
  let keys = _.keys(schema);
  if(_.size(whitelist)) keys = _.intersection(keys, whitelist);
  let tp = schema.type;
  // filtering keys only works for simple types; won't bother filtering on value applied to.
  // could pass if wrong type in validators, or add checks, but I'd like to find the failures
  if(_.isString(tp)) {
    let relevant = validatorsForType(tp, verbose);
    keys = _.intersection(keys, relevant);
  }
  return keys;
}

// get validator keys applicable to a type
// cf. https://github.com/epoberezkin/ajv/blob/master/lib/compile/rules.js
// could also add implicit type-specific validators, e.g. `uniqueKeys` for object.
function validatorsForType(type: string, verbose: boolean = false): string[] {
  // const keywords = [ '$schema', 'id', 'title', 'description', 'default' ];
  // ^ keys in json-schema not relevant for validation
  // const types = [ 'number', 'integer', 'string', 'array', 'object', 'boolean', 'null' ];
  const NUM = ['maximum', 'minimum', 'multipleOf', 'exclusiveMaximum', 'exclusiveMinimum'];
  const ALL = ['type', '$ref', 'enum', 'not', 'anyOf', 'oneOf', 'allOf'];
  const validatorsByType = {
    number: NUM,
    integer: NUM,
    string:
        ['maxLength', 'minLength', 'pattern', 'format', 'required_field'], // last custom
    array:
        ['maxItems', 'minItems', 'uniqueItems']
            .concat(verbose ? ['items', 'additionalItems'] : []),
    object:
        ['maxProperties', 'minProperties', 'required'] //, 'dependencies'
            .concat(verbose ? ['properties', 'patternProperties', 'additionalProperties'] : []),
        // custom: uniqueKeys -- implied in object, don't intersect with spec keys
    // boolean: [],
    // null: [],
  };
  return ALL.concat(validatorsByType[type] || []);
}

// maps json-schema validators to validator functions used by Angular form controls
const valFns: {[key: string]: (par: any) => ValidatorFn} =
  mapBoth((fn, k) => (par) => (c) =>
  // mapBoth(_.curry((fn, k, par, c) =>
    par != null && !fn(c.value, par, c.schema) ? _.fromPairs([[k, true]]) : null
    // { [k]: true }
  )(valConds);
  // ));
// ... _.keys(valConds).map((k) => ... valConds[k] ...
// const ng_validators = _.assign(Validators, valFns);

// check if a value matches a given type
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
  // required: x => v => `Required fields: ${JSON.stringify(x)}`, // objects, don't show error here
  required_field: x => v => `This field is required.`,  // fields, custom, show error here instead
      // ^ I had to override ng2's Validator key from `required` since I'm using their trigger.
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
  additionalItems: x => v => `Additional items should match schema ${JSON.stringify(x)}.`,
  properties: x => v => `Properties should match schema ${JSON.stringify(x)}.`,
  patternProperties: x => v => `Pattern properties should match schema ${JSON.stringify(x)}.`,
  additionalProperties: x => v => `Additional properties should match schema ${JSON.stringify(x)}.`,
  anyOf: x => v => `Should match any of schemas ${JSON.stringify(x)}.`,
  allOf: x => v => `Should match all of schemas ${JSON.stringify(x)}.`,
  oneOf: x => v => `Should match one of schemas ${JSON.stringify(x)}.`,
  format: x => v => `Should match format '${x}'.`,
  $ref: x => v => `Unresolved reference: '${x}'`,
  // custom
  uniqueKeys: x => v => `All keys must be unique.`,
};

export const VAL_FUN_KEYS: string[] = _.keys(valConds);
export const VAL_MSG_KEYS: string[] = _.keys(valErrors);

// prepare the form control validators
export function getValidator(schema: Front.Schema): ValidatorFn {
  const ofs = ['anyOf','oneOf','allOf'];
  let of_vals = ofs.reduce(
    (acc, k) => acc.concat(_.get([k], schema) || [])
  , []).map(opt => getValidator(opt));
  let of_vldtrs = of_vals.map(opt => opt.validator);
  let of_vldtr = (c) => of_vldtrs.some(x => !x);
  let keys = relevantValidators(schema, VAL_FUN_KEYS);
  let validators = keys.map(k => valFns[k](schema[k])).concat(of_vldtr);
  return Validators.compose(validators);
}

// async validators: https://medium.com/@daviddentoom/angular-2-form-validation-9b26f73fcb81
