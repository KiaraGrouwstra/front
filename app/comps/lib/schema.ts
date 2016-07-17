let _ = require('lodash/fp');
import { arr2obj, mapBoth } from './js';
import { formatMap, validateFormat, validatorsForType } from '../slim/input/validators';

export const SCALARS = ['boolean', 'integer', 'number', 'string', 'null'];
export const OFS = ['anyOf','oneOf','allOf'];

// generate a schema for a given value, with root stuff added
export function getRootSchema(v: any, settings: Front.IGenSchemaSettings = {}): Front.Schema {
  return _.assign(getSchema(v, settings), {
    '$schema': 'http://json-schema.org/draft-04/schema#',
  });
}

// generate a schema for a given value
export function getSchema(v: any, settings: Front.IGenSchemaSettings = {}): Front.Schema {
  let type = getType(v);
  let schema = { type };
  if (_.isArray(v)) {
    let mapped = v.map(x => getSchema(x, settings));
    schema.items = mapped.reduce((a, b) => mergeSchemas(a, b, false), strictest); // type: 'any'
    if (settings.verbose) {
      let len = v.length;
      Object.assign(schema, {
        maxItems: len,
        minItems: len,
        additionalItems: false,
        uniqueItems: len == _.uniq(v).length,
      })
    }
  } else if (_.isObject(v)) {
    schema.properties = _.mapValues(x => getSchema(x, settings), v);
    if (settings.verbose) {
      let keys = _.keys(v);
      let len = keys.length;
      Object.assign(schema, {
        maxProperties: len,
        minProperties: len,
        required: keys,
        patternProperties: {},
        additionalProperties: false,
      });
    }
  } else if (_.isNumber(v)) {
    if (settings.verbose) {
      Object.assign(schema, {
        // multipleOf: v,
        maximum: v,
        minimum: v,
        // exclusiveMaximum,
        // exclusiveMinimum,
      });
    }
  } else if (_.isString(v)) {
    if (settings.verbose) {
      Object.assign(schema, {
        maxLength: v.length,
        minLength: v.length,
        // pattern
        enum: [v],
        format: _.keys(formatMap).find(frmt => validateFormat(v, frmt)) || null,
        // I'd actually need to check all formats and have a way to recognize stricter formats...
      })
    }
  }
  return schema;
};

// enum JSON_SCHEMA_TYPES {};

// get a json-schema string representation of the type of a value
function getType(v: any): string {
  return _.isArray(v) ? 'array' :
    _.isObject(v) ? 'object' :
      _.isNumber(v) ?
        (_.isInteger(v) ? 'integer' : 'number') :
        _.isString(v) ? 'string' :
          _.isNull(v) ? 'null' :
            _.isBoolean(v) ? 'boolean' : 'any';
}

// check a symmetric condition to merge two schemas, with an asymmetric tie-breaker as fallback.
function checkSym(
  lambda: Front.ValSchemaMergeFn,
  fallback: Front.ValSchemaMergeFn = ([a,b]) => undefined,
): Front.ValSchemaMergeFn {
  return ([a, b], [acc, val]) => {
    let symm;
    symm = lambda([a, b], [acc, val]);
    if (!_.isUndefined(symm)) return symm;
    symm = lambda([b, a], [val, acc]);
    if (!_.isUndefined(symm)) return symm;
    let def = fallback([a, b], [acc, val]);
    return def;
  };
}

// get the applicable properties for a given type from a schema
function typeSchema(type: string, obj: Front.Schema): Front.Schema {
  let schema = { type };
  // const num = ['maximum','minimum','exclusiveMaximum','exclusiveMinimum']; //'multipleOf',
  // const props = {
  //   integer: num,
  //   number: num,
  //   string:
  //     ['maxLength','minLength','pattern','enum','format'],
  //   'array':
  //     ['maxItems','minItems','additionalItems','uniqueItems'],
  //   'object':
  //     ['maxProperties', 'minProperties', 'required', 'properties', 'patternProperties', 'additionalProperties'],
  //   // REST: ['id', '$schema', 'title', 'description', 'default', 'definitions', 'dependencies', 'type'],
  // };
  // let relevant = props[type];
  let relevant = validatorsForType(type, true);
  relevant.forEach(k => {
    if(!_.isUndefined(obj[k])) {
      schema[k] = obj[k];
      obj[k] = undefined;
    }
  });
  return schema;
};

// merge two schemas into one; by default for each key go with the more lenient schema.
export function mergeSchemas(acc: Front.Schema, val: Front.Schema, strict: boolean = false): Front.Schema {
  if(!val) return acc;
  if(!acc) return val;
  let wrapper = strict ? onlyOrFn : undefOrFn;
  let mapped = mapBoth((fn, k) => wrapper(fn(strict))([acc[k], val[k]], [acc, val]))(mergers);
  // `oneOf` is unlike the rest -- merging writes results to other keys
  let withOneOf = acc.oneOf && val.oneOf ?
      _.update(strict ? 'allOf' : 'anyOf', (v) => (_.size(v) ? v : []).concat([acc.oneOf, val.oneOf]))(mapped) :
      acc.oneOf ?
        strict ? _.set('oneOf', acc.oneOf)(mapped) : mapped :
        val.oneOf ?
          strict ? _.set('oneOf', val.oneOf)(mapped) : mapped :
          mapped;
  return _.pickBy(y => !_.isUndefined(y))(withOneOf);
}

// wrapper to merge to the stricter option: if one is undefined, pick the other one
let onlyOrFn = (fn) => ([a, b], accs) => _.isUndefined(a) ? b : _.isUndefined(b) ? a : fn([a, b], accs);

// wrapper to merge to the more lenient option: if one is undefined, then pick undefined
let undefOrFn = (fn) => (arr, accs) => _.some(_.isUndefined)(arr) ? undefined : fn(arr, accs);

// merge `additionalProperties` of two schemas
let checkAdditional: Front.ValSchemaMergeFn = (strict: boolean = false) => checkSym(
  ([x, y]) => {
    if (x == !strict) return !strict; // false is stricter, true is more lenient
    if (x == strict) return y;  // true is recessive on strict, false on lenient
    if (_.isObject(x) && _.isObject(y)) return mergeSchemas(x, y, strict);
  }
);

// merge keys of two schemas (for `properties` and `patternProperties`)
let checkProperties = (strict: boolean = false) => ([a, b]: Front.Schema[]) => { //: Front.Schema
  if(a) {
    let keys = _.uniq([..._.keys(a), ..._.keys(b)]);
    let pairs = arr2obj(keys, k => a ? [a[k], b[k]] : b[k]);
    let merged = _.mapValues(opts => mergeSchemas(...opts, strict))(pairs);
    return merged;
  } else {  // a: null
    return b;
  }
}

// merging maximum limits means taking the lower one for strict, etc.
let mergeMax = (strict: boolean = false) => strict ? _.min : _.max;
let mergeMin = (strict: boolean = false) => strict ? _.max : _.min;

let union = arr => _.union(...arr);
// with lists of requirements, taking more is stricter
let mergeReqs = (strict: boolean = false) => strict ? union :
    (arr) => {
      let sect = _.intersection(...arr);
      return sect.length ? sect : undefined;
    };
// with lists of options, allowing less is stricter
let mergeOpts = (strict: boolean = false) => strict ?
    (arr) => _.intersection(...arr) :
    // ^ [] if no overlap -- spec disallows it for `enum`, but correct here
    union;

// unimplemented
let mergeFormat = (strict: boolean = false) => strict ? _.last :
    checkSym(
      ([x, y]) => _.isNull(x) ? y : undefined,
      _.last
    )

// used to merge non-validation properties
let last = (strict: boolean = false) => (arr) => _.last(arr);

let mergeUnique = (strict: boolean = false) => opts => opts[strict ? 'some' : 'every'](y => y) || undefined;

let mergeItems = (strict: boolean = false) => checkSym(
  ([x, y], [xObj, yObj]) => {
    if (_.isArray(x) && _.isArray(y)) {
      return _.zip([x, y]).map(([a, b]) => mergeSchemas(a, b, strict));
    } else if (_.isArray(x) && _.isObject(y)) {
      if(!x.length) {
        return y;
      } else if(strict) {
        if(y.allOf) {
          return { allOf: _.uniq(y.allOf.concat(x)) };
          // ^ merge further than leaving all non-equal ones?
        } else {
          return { allOf: _.uniq(x.concat(y)) };
        }
      } else {
        if(y.anyOf) {
          return { anyOf: _.uniq(y.anyOf.concat(x)) };
          // ^ merge further than leaving all non-equal ones?
        } else {
          return { anyOf: _.uniq(x.concat(y)) };
        }
      }
    }
  },
  ([a,b]) => (_.isPlainObject(a) && _.isPlainObject(b)) ? mergeSchemas(a, b, strict) : undefined
);

// with types, `any` is lenient, `null` seems most restrictive... others are mostly hard to compare
let mergeType = (strict: boolean = false) => checkSym(
  ([x, y], [xObj, yObj]) => {
    if (_.isNull(x)) {
      return strict ? null : y;
    }
    if (_.isEqual(x, y)) {
      return x;  // totally ignores all other properties!
    }
    if (x == 'any') {
      return strict ? y : 'any';
    }
    if (x == 'number' && y == 'integer') return strict ? 'integer' : 'number';
    if(strict) {
      if (_.isObject(x) && x.allOf) {
        let other = (_.isObject(y) && y.allOf) ? y.allOf : typeSchema(y, yObj);
        return { allOf: _.uniq(x.allOf.concat(other)) };
      }
    } else {
      if (_.isObject(x) && x.anyOf) {
        let other = (_.isObject(y) && y.anyOf) ? y.anyOf : typeSchema(y, yObj);
        return { anyOf: _.uniq(x.anyOf.concat(other)) };
      }
    }
    // merge further than leaving all non-equal ones?
    // `.concat()` won't work if `anyOf` is a `$ref` array!
  },
  ([a,b], [acc, val]) => ({ [strict ? 'allOf' : 'anyOf']: [typeSchema(a, acc), typeSchema(b, val)] })
);

// issue: this gets tried with an `undefined` both when combining with a schema
// that doesn't require it (in which case I should return undefined too),
// as well as when there is some new nested schema that apparently should get it.
// not sure how to handle this, so ignoring `multipleOf` for lenient merge for now...
// let gcd = ([a, b]) => !b ? a : gcd(b, a % b);
let gcd = ([a, b]) => !a ? a : !b ? b : gcd(b, a % b);
let mergeMultiple = (strict: boolean = false) => strict ?
  ([a, b]) => a * b / gcd([a, b]) :
  () => undefined; //gcd

// for each key in a schema specify how to merge schemas, either stricter (inject true) or more lenient
const mergers = {
  // NUMBERS:
  multipleOf: mergeMultiple,
  maximum: mergeMax,
  minimum: mergeMin,
  exclusiveMaximum: mergeMax,
  exclusiveMinimum: mergeMin,

  // STRINGS:
  maxLength: mergeMax,
  minLength: mergeMin,
  // pattern
  enum: mergeOpts,
  format: mergeFormat,

  // ARRAYS:
  items: mergeItems,
  maxItems: mergeMax,
  minItems: mergeMin,
  additionalItems: checkAdditional,
  uniqueItems: mergeUnique,

  // OBJECTS:
  maxProperties: mergeMax,
  minProperties: mergeMin,
  required: mergeReqs,
  properties: checkProperties,
  patternProperties: checkProperties,
  additionalProperties: checkAdditional,

  // MISC:
  type: mergeType,
  allOf: mergeReqs,
  anyOf: mergeOpts,
  // oneOf // extra items -> more options AND limitations; solved separately above (writes to different keys)
  not: (strict) => ([a, b]) => mergeSchemas(a, b, !strict),

  // id
  // '$schema'
  // title
  // description
  default: last,
  definitions: checkProperties,
  dependencies: (strict) => (arr) => _.assign(...arr),
  // ^ assumes no value conflicts, cuz no real way to resolve them
};



const MAX_NUM = Number.MAX_VALUE;
const MIN_NUM = Number.MIN_VALUE;

// most lenient schema: empty. use when reducing `mergeSchema()` to the stricter one.
const most_lenient = {};

// for each key in a schema specify the strictest value, i.e. the defaults to start from
const strictest = {
  // NUMBERS:
  // multipleOf: MAX_NUM,
  maximum: MIN_NUM,
  minimum: MAX_NUM,
  exclusiveMaximum: MIN_NUM,
  exclusiveMinimum: MAX_NUM,

  // STRINGS:
  maxLength: MIN_NUM,
  minLength: MAX_NUM,
  // pattern
  enum: undefined,
  format: null, // use null for 'all required' so undefined can remain 'nothing required'

  // ARRAYS:
  items: [], // undefined
  maxItems: MIN_NUM,
  minItems: MAX_NUM,
  additionalItems: false,
  uniqueItems: true,

  // OBJECTS:
  maxProperties: MIN_NUM,
  minProperties: MAX_NUM,
  required: null, // use null for 'all required' so undefined can remain 'nothing required'
  properties: null, // {}
  patternProperties: undefined, // {}
  additionalProperties: false,

  // MISC:
  // id
  // '$schema'
  // title
  // description
  // default
  definitions: undefined,
  dependencies: undefined,
  type: null, // use null for 'all required' so undefined can remain 'nothing required'
};

// getRootSchema({ foo: [1, 2, 'a'] }, { verbose: true });
// getSchema({ foo: [1, 2, 'a'] });

// bugs:
// - `multipleOf` isn't removed from `items`
// - without `verbose` on `multipleOf` stays at MAX instead of 1
