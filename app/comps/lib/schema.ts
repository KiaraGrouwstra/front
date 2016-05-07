let _ = require('lodash/fp');
import { arr2obj, mapBoth } from './js';

// generate a schema for a given value
export let getRootSchema = (v, settings = {}) => _.assign(getSchema(v, settings), { '$schema': 'http://json-schema.org/draft-04/schema#' });

export let getSchema = (v, settings = {}) => {
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
      })
    }
  }
  return schema;
};

let getType = (v) => _.isArray(v) ? 'array' : _.isObject(v) ? 'object' : _.isNumber(v) ? (_.isInteger(v) ? 'integer' : 'number') : _.isString(v) ? 'string' : _.isNull(v) ? 'null' : _.isBoolean(v) ? 'boolean' : 'any';

let checkSym = (lambda, fallback = ([a,b]) => undefined) => ([a, b], [acc, val]) => {
  let symm;
  symm = lambda([a, b], [acc, val]);
  if (!_.isUndefined(symm)) return symm;
  symm = lambda([b, a], [val, acc]);
  if (!_.isUndefined(symm)) return symm;
  let def = fallback([a, b], [acc, val]);
  return def;
};

let checkAdditional = checkSym(
  ([x, y]) => {
    if (x == true) return true;
    if (x == false) return y;
    if (_.isObject(x) && _.isObject(y)) return mergeSchemas(x, y);
  }
);

let min = ([a,b]) => (a && b) ? _.min([a,b]) : undefined;

let max = ([a,b]) => (a && b) ? _.max([a,b]) : undefined;

let checkProperties = ([a,b]) => {
  if (a && b) {
    let keys = _.uniq([..._.keys(a), ..._.keys(a)]);
    let pairs = arr2obj(keys, k => [a[k], b[k]]);
    let merged = _.mapValues(opts => mergeSchemas(...opts))(pairs);
    return merged;
  } else {
    return a ? a : b;
  }
}

let typeSpec = (type, obj) => {
  let schema = { type };
  let props = {
    integer:
      ['maximum','minimum','exclusiveMaximum','exclusiveMinimum'], //'multipleOf',
    number:
    ['maximum','minimum','exclusiveMaximum','exclusiveMinimum'], //'multipleOf',
    string:
      ['maxLength','minLength','pattern','enum'],
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

export let mergeSchemas = (acc, val) => {
  if(!val) return acc;
  if(!acc) return val;
  // let mapped = mapBoth(mergers, (fn, k) => fn([acc[k], val[k]], [acc, val]));
  let mapped = mapBoth(mergers, (fn, k) => fn([acc[k], val[k]], [acc, val]));
  return _.pickBy(y => !_.isUndefined(y))(mapped);
}

// issue: this gets tried with an `undefined` both when combining with a spec that doesn't require it (in which case I should return undefined too), as well as when there is some new nested spec that apparently should get it. not sure how to handle this, so kicking multipleOf out for now...
// let gcd = (a, b) => !b ? a : gcd(b, a % b);
// let gcd = (a, b) => !a ? a : !b ? b : gcd(b, a % b);

let mergers = {
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
  enum: ([a, b]) => (a && b) ? _.union(a, b) : a ? b : a, // just union could return [], which the spec doesn't allow

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
        let other = (_.isObject(y) && y.anyOf) ? y.anyOf : typeSpec(y, yObj);
        return { anyOf: _.uniq(x.anyOf.concat(other)) };
      }
      // merge further than leaving all non-equal ones?
      // `.concat()` won't work if `anyOf` is a `$ref` array!
      // allOf
      // anyOf
      // oneOf
      // not
    },
    ([a,b], [acc, val]) => ({ anyOf: [typeSpec(a, acc), typeSpec(b, val)] })
  ),
};

let max_num = Number.MAX_VALUE;
let min_num = Number.MIN_VALUE;

let strictest = {
  // NUMBERS:
  // multipleOf: max_num,
  maximum: min_num,
  minimum: max_num,
  exclusiveMaximum: min_num,
  exclusiveMinimum: max_num,

  // STRINGS:
  maxLength: min_num,
  minLength: max_num,
  // pattern
  enum: undefined,

  // ARRAYS:
  items: [], // undefined
  maxItems: min_num,
  minItems: max_num,
  additionalItems: false,
  uniqueItems: true,

  // OBJECTS:
  maxProperties: min_num,
  minProperties: max_num,
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
