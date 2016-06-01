let _ = require('lodash/fp');
import { arr2obj, mapBoth } from './js';
import { formatMap, validateFormat } from '../slim/input/validators';

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
    schema.items = mapped.reduce(mergeSchemas, strictest); // type: 'any'
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
      })
    }
  } else if (_.isNumber(v)) {
    if (settings.verbose) {
      Object.assign(schema, {
        // multipleOf: v,
        maximum: v,
        minimum: v,
        // exclusiveMaximum,
        // exclusiveMinimum,
      })
    }
  } else if (_.isString(v)) {
    if (settings.verbose) {
      Object.assign(schema, {
        maxLength: v.length,
        minLength: v.length,
        // pattern
        enum: [v],
        format: _.find(frmt => validateFormat(v, frmt))(_.keys(formatMap)) || null,
        // I'd actually need to check all formats and have a way to recognize stricter formats...
      })
    }
  }
  return schema;
};

// enum JSON_SCHEMA_TYPES {};

// get a json-schema string representation of the type of a value
function getType(v: any): string {
  return _.isArray(v) ? 'array' : _.isObject(v) ? 'object' : _.isNumber(v) ? (_.isInteger(v) ? 'integer' : 'number') : _.isString(v) ? 'string' : _.isNull(v) ? 'null' : _.isBoolean(v) ? 'boolean' : 'any';
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

// merge `additionalProperties` of two schemas
let checkAdditional: Front.ValSchemaMergeFn = checkSym(
  ([x, y]) => {
    if (x == true) return true;
    if (x == false) return y;
    if (_.isObject(x) && _.isObject(y)) return mergeSchemas(x, y);
  }
);

// take the less strict (lower) maximum value out of two
function min([a, b]: number[]): number {
  return (a && b) ? _.min([a,b]) : undefined;
}

// take the less strict (higher) minimum value out of two
function max([a, b]: number[]): number {
  return (a && b) ? _.max([a,b]) : undefined;
}

// merge all keys of two schemas (for `properties` and `patternProperties`)
function checkProperties([a, b]: Front.Schema[]): Front.Schema {
  if (a && b) {
    let keys = _.uniq([..._.keys(a), ..._.keys(a)]);
    let pairs = arr2obj(keys, k => [a[k], b[k]]);
    let merged = _.mapValues(opts => mergeSchemas(...opts))(pairs);
    return merged;
  } else {
    return a ? a : b;
  }
}

// get the applicable Schemaifications for a given type from a schema
function typeSchema(type: string, obj: Front.Schema): Front.Schema {
  let schema = { type };
  const props = {
    integer:
      ['maximum','minimum','exclusiveMaximum','exclusiveMinimum'], //'multipleOf',
    number:
    ['maximum','minimum','exclusiveMaximum','exclusiveMinimum'], //'multipleOf',
    string:
      ['maxLength','minLength','pattern','enum','format'],
    'array':
      ['maxItems','minItems','additionalItems','uniqueItems'],
    'object':
      ['maxProperties', 'minProperties', 'required', 'properties', 'patternProperties', 'additionalProperties'],
    // REST: ['id', '$schema', 'title', 'description', 'default', 'definitions', 'dependencies', 'type'],
  }
  props[type].forEach(k => {
    if(!_.isUndefined(obj[k])) {
      schema[k] = obj[k];
      obj[k] = undefined;
    }
  });
  return schema;
};

// merge two schemas into one, i.e. for each key go with the less strict schema.
export function mergeSchemas(acc: Front.Schema, val: Front.Schema): Front.Schema {
  if(!val) return acc;
  if(!acc) return val;
  // let mapped = mapBoth(mergers, (fn, k) => fn([acc[k], val[k]], [acc, val]));
  let mapped = mapBoth(mergers, (fn, k) => fn([acc[k], val[k]], [acc, val]));
  return _.pickBy(y => !_.isUndefined(y))(mapped);
}

// issue: this gets tried with an `undefined` both when combining with a schema that doesn't require it (in which case I should return undefined too), as well as when there is some new nested schema that apparently should get it. not sure how to handle this, so kicking multipleOf out for now...
// let gcd = (a, b) => !b ? a : gcd(b, a % b);
// let gcd = (a, b) => !a ? a : !b ? b : gcd(b, a % b);

// for each key in a schema specify how to merge schemas, i.e. how to select the less strict schema.
const mergers = {
  // NUMBERS:
  // multipleOf: ([a, b]) => gcd(a, b),
  maximum: max,
  minimum: min,
  exclusiveMaximum: max,
  exclusiveMinimum: min,

  // STRINGS:
  maxLength: max,
  minLength: min,
  // pattern
  enum: ([a, b]) => (a && b) ? _.union(a, b) : a ? b : a, // just union could return [], which the schema doesn't allow
  format: checkSym(
    ([x, y], [xObj, yObj]) => {
      if (_.isUndefined(x)) {
        return undefined;
      }
      if (_.isNull(x)) {
        return y;
      }
      if (_.isEqual(x, y)) {
        return x;  // totally ignores all other properties!
      }
      // merge further than leaving all non-equal ones?
    },
    ([a,b], [acc, val]) => undefined
  ),

  // ARRAYS:
  items: checkSym(
    ([x, y], [xObj, yObj]) => {
      if (_.isArray(x) && _.isArray(y)) return _.zip([x, y]).map(([a, b]) => mergeSchemas(a, b));
      if (_.isArray(x) && _.isObject(y)) {
        if(!x.length) {
          return y;
        } else if(y.anyOf) {
          return { anyOf: _.uniq(y.anyOf.concat(x)) };  // merge further than leaving all non-equal ones?
        } else {
          return { anyOf: _.uniq(x.concat(y)) };
        }
      }
    },
    ([a,b]) => (_.isObject(a) && _.isObject(b)) ? mergeSchemas(a, b) : undefined
  ),
  maxItems: max,
  minItems: min,
  additionalItems: checkAdditional,
  uniqueItems: opts => _.every(y => y)(opts) || undefined,

  // OBJECTS:
  maxProperties: max,
  minProperties: min,
  required: ([a,b]) => {
    if (a && b) {
      let sect = _.intersection(a,b);
      return sect.length ? sect : undefined;
    } else {
      return _.isNull(a) ? b : a;
    }
  },
  properties: checkProperties,
  patternProperties: checkProperties,
  additionalProperties: checkAdditional,

  // MISC:
  // id
  // '$schema'
  // title
  // description
  // default
  definitions: checkProperties,
  dependencies: ([a, b]) => (a && b) ? _.assign(a, b) : a ? a : b, // assumes no value conflicts, cuz no real way to resolve them
  type: checkSym(
    ([x, y], [xObj, yObj]) => {
      if (_.isUndefined(x)) {
        return undefined;
      }
      if (_.isNull(x)) {
        return y;
      }
      if (_.isEqual(x, y)) {
        return x;  // totally ignores all other properties!
      }
      if (x == 'any') {
        return 'any';
      }
      if (x == 'number' && y == 'integer') return 'number';
      if (_.isObject(x) && x.anyOf) {
        let other = (_.isObject(y) && y.anyOf) ? y.anyOf : typeSchema(y, yObj);
        return { anyOf: _.uniq(x.anyOf.concat(other)) };
      }
      // merge further than leaving all non-equal ones?
      // `.concat()` won't work if `anyOf` is a `$ref` array!
      // allOf
      // anyOf
      // oneOf
      // not
    },
    ([a,b], [acc, val]) => ({ anyOf: [typeSchema(a, acc), typeSchema(b, val)] })
  ),
};

const MAX_NUM = Number.MAX_VALUE;
const MIN_NUM = Number.MIN_VALUE;

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
  properties: undefined, // {}
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
