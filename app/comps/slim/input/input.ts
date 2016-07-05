let _ = require('lodash/fp');
let marked = require('marked');
import { FormGroup, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { SchemaControlList, SchemaControlVector, SchemaControlObject, ControlObjectKvPair, SchemaControlStruct, SchemaControlSet, SchemaControlPolyable } from './controls';
import { getPaths } from '../slim';
import { validate, getValidator } from './validators';
import { arr2obj, editValsOriginal, mapBoth } from '../../lib/js';
import { SchemaFormControl } from './controls';

// get the default value for a value type
function typeDefault(type: string): any {
  let def_vals = {
    string: '',
    number: 0,
    integer: 0,
    boolean: false,
    array: [],
    object: {},
    // file: 'file', //[],
  };
  return _.get([type], def_vals);
}

export function getDefault(schema: Front.Schema): any {
  let def = schema.default;
  return (!_.isUndefined(def)) ? def : typeDefault(schema.type);
}

// get the input type for a value type
let inputType = (type: string) => _.get([type], {
  string: 'text',
  number: 'number',
  integer: 'number',
  boolean: 'checkbox',
  file: 'file',
}) || type;

// pick a pug template
export function getTemplate(schema: Front.Schema, attrs: Front.IAttributes): string|void {
  return schema['x-template'] || _.get([schema.type], {
    //enum: white-listed values (esp. for string) -- in this case make scalars like radioboxes/drop-downs for input, or checkboxes for enum'd string[].
    // string: schema.enum ? (attrs.exclusive ? 'select' : 'datalist') : null,
    string: _.size(attrs.suggestions) ? 'datalist' : _.size(schema.enum) ? 'select' : null,
    // string: _.size(attrs.suggestions) ? 'datalist' : _.size(schema.enum) ? 'radio' : null,
    // ^ radio over select? alt. autocomplete over datalist?
    integer: (attrs.max && attrs.min && attrs.max > attrs.min) ? 'range' : null,
    // number: null,
    boolean: 'switch',
    date: 'date',
    file: 'file',
    // array: schema.uniqueItems && _.size(schema.enum) ? 'checkboxes' : null,
    // how to trigger, since only `input-field` runs by here?
    // ^ I'll assume `enum` implies scalar (checking in the face of *Of may be hard); otherwise how could I visualize?
    // object: [fieldset],
  }) || 'input';
}

// return the default value + validator for a schema
function vldtrDefPair(schema: Front.Schema): Front.IVldtrDef {
  return {
    val: getDefault(schema),
    vldtr: getValidator(schema),
  };
}

// map a schema's subschemas given a lambda
export function mapSchema<T,U>(fn: (T) => U): Front.IObjectSchema<(T) => U> {
  return editValsOriginal({
    properties: mapBoth(fn),
    patternProperties: mapBoth(fn),
    additionalProperties: fn,
  });
}

// get a struct of validator-default pairs of a schema
// : Front.IObjectSchema<(Front.Schema) => Front.IVldtrDef>
export let getValStruct = mapSchema(vldtrDefPair);

// `ControlObject` generator (kicked out of `inputControl`)
export function objectControl(schema: Front.Schema, doSeed: boolean = false): SchemaControlObject {
  // let validator = getValidator(schema);
  let ctrl = new SchemaControlObject(schema);
  if(doSeed) ctrl.init();
  return ctrl;
}

// return initial key/value pair for the model
export function inputControl(
  schema: Front.Schema = {},
  path: string[] = [],
  asFactory: boolean = false,
): AbstractControl | Front.CtrlFactory {
  const controlMap = {
    array: (schema) =>
      // only tablize predictable collections
      _.isArray(schema.items) ?
        SchemaControlVector :
        // ^ SchemaControlVector could also handle the simpler case below.
      schema.uniqueItems && _.size(schema.items.enum) ?
        SchemaControlSet :
        SchemaControlList,
    // object: (schema) => (schema.patternProperties || schema.additionalProperties) ? SchemaControlStruct : SchemaFormGroup,
    object: () => SchemaControlStruct,
    // SchemaControlObject
  };
  let fn = controlMap[schema.type];
  let cls = schema['x-polyable'] ? SchemaControlPolyable : fn ? fn(schema) : SchemaFormControl;
  let factory = () => new cls(schema, path);
  return asFactory ? factory : factory();
}

const MAX_ITEMS = _.toLength(Infinity); // Math.pow(2, 32) - 1 // 4294967295

// get the html attributes for a given parameter/input
// http://swagger.io/specification/#parameterObject
export function inputAttrs(path: Front.Path, spec: Front.ApiSpec.definitions.parameter | Front.Schema): Front.IAttributes {
  // general parameters
  let { name, in: kind, description: desc, required: req, required_field: req_field, schema, type, format, allowEmptyValue: allow_empty, items, collectionFormat, default: def, maximum: inc_max, exclusiveMaximum: ex_max, minimum: inc_min, exclusiveMinimum: ex_min, pattern, minLength, maxLength, maxItems, minItems, maxProperties, minProperties, uniqueItems, exclusive, suggestions, enum: enum_options, multipleOf, } = spec;
  desc = marked(desc || '') //.stripOuter();
  let { id } = getPaths(path);  //, k, variable, model: elvis
  let key = name;  // variable
  let attrs = {
    id,
    suggestions,
  };
  // if(desc) attrs.placeholder = description;

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
    // parameters: maxProperties, minProperties, required,
    //   break;
  }
  let AUTO_COMP = ['name', 'honorific-prefix', 'given-name', 'additional-name', 'family-name', 'honorific-suffix', 'nickname', 'email', 'username', 'new-password', 'current-password', 'organization-title', 'organization', 'street-address', 'address-line1', 'address-line2', 'address-line3', 'address-level4', 'address-level3', 'address-level2', 'address-level1', 'country', 'country-name', 'postal-code', 'cc-name', 'cc-given-name', 'cc-additional-name', 'cc-family-name', 'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type', 'transaction-currency', 'transaction-amount', 'language', 'bday', 'bday-day', 'bday-month', 'bday-year', 'sex', 'tel', 'url', 'photo'];

  // type-specific html attributes
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
  attrs.type = inputType(type);
  return _.pickBy(_.negate(_.isNil))(attrs);
}

// // set `required_field` for an sub-schema based on the `required` property of its parent object schema
// export function setItemRequired(schema: Front.Schema, obj_schema: Front.Schema, key: string): Front.Schema {
//   return (obj_schema.required || []).includes(key) ?
//       _.set(['required_field'], true)(schema) :
//       schema;
// }

// set all `required_field` properties for an object schema based on its `required` property
export function setRequired(schema: Front.Schema): Front.Schema {
  let required = schema.required;
  // return mapSchema(setter(required));
  // ^ lazy, would force checking the whole array each time if I weren't using ng2's solution
  let patterns = _.keys(schema.patternProperties);
  let fixed = _.intersection(required, _.keys(schema.properties));
  let unsorted = _.difference(required, fixed);
  let { rest, patts } = categorizeKeys(patterns)(unsorted);
  let setter = (v) => _.set(['required_field'], v);
  return editValsOriginal({
    // properties: mapBoth(setter(fixed)),
    properties: mapBoth((item_schema, key) => setter(fixed.includes(key) ? true : undefined)(item_schema)),
    patternProperties: mapBoth((item_schema, patt) => setter(patts[patt])(item_schema)),
    additionalProperties: setter(rest),
  })(schema);
}

// key uniqueness validator for ControlObject
export function uniqueKeys(name_lens: (AbstractControl) => string): ValidatorFn {
  return (ctrl: AbstractControl) => {
    let names = name_lens(ctrl);
    let valid = names.length == _.uniq(names).length;
    return valid ? null : { uniqueKeys: true };
  };
}

// calculate the different schemas for key input controls, plus enum/suggestion options
// any schema-like object will do for the param, since only keys are checked.
export function getOptsNameSchemas(obj: Front.IObjectSchema<any>): Object {
  let { properties: props, patternProperties: patterns, additionalProperties: add } = obj;
  let [fixed, patts] = [props, patterns].map(_.keys);
  let categorizer = categorizeKeys(patts, fixed);
  let sugg = categorizer(_.get(['x-keys', 'suggestions'], obj) || []);
  let { rest: addSugg, patts: pattSugg } = categorizer(_.get(['x-keys', 'suggestions'], obj) || []);
  let { rest: addEnum, patts: pattEnum } = categorizer(_.get(['x-keys', 'enum'], obj) || []);
  let nameSchema = { name: 'name', type: 'string', required_field: true };
  let nameSchemaFixed = _.assign(nameSchema, { enum: fixed });
  let nameSchemaPatt = arr2obj(patts, patt => _.assign(nameSchema,
    { enum: pattEnum[patt], suggestions: pattSugg[patt] }
  ));
  let nameSchemaAdd = _.assign(nameSchema, { enum: addEnum, suggestions: addSugg, not: {
    anyOf: patts.map(patt => ({ pattern: patt })).concat({ enum: fixed })
  }});
  return { nameSchemaFixed, nameSchemaPatt, nameSchemaAdd, addSugg, pattSugg, addEnum, pattEnum };
};

// find the pattern matching a key
export let patternSorter = (patterns: string[]) => (k: string) => patterns.find(patt => new RegExp(patt).test(k));

// categorize keys to a pattern or additional
export function categorizeKeys(patterns, blacklist = []):
    (keys: string[]) => { rest: string[], patts: {[key: string]: string[]} } {
  return (keys: string[]) => {
    let r = _.difference(keys, blacklist);
    let sorter = patternSorter(patterns);
    // let { undefined: rest, ...patts } = _.groupBy(sorter)(r); // without TS
    let grouped = _.groupBy(sorter)(r);
    let rest = grouped.undefined;
    let patts = _.omit('undefined')(grouped);
    return { rest, patts };
  };
}

// split a string path to an array
export function splitPath(path: string) {
  return path.split('/').map(s => isNaN(s) ? s : Number(s));
}

// like `AbstractControl`'s 'find()`, but also deals with Polymorphic/Object/Struct controls.
export function findControl(control: AbstractControl, path: Front.Path | string) {
  let arrPath = _.isArray(path) ? path : splitPath(path);
  return arrPath.reduce((acc, v, idx) => {
    let ctrl = acc.ctrl ? acc.ctrl : acc; // PolymorphicControl
    return _.isNumber(v) ?
        ctrl.at ? ctrl.at(v) :   // FormArray (ControlList)
        ctrl.controls['additionalProperties'].at(v) : // ControlStruct: additional
        ctrl.byName ? acc.byName(v) :   // ControlStruct (ControlObject)
        ctrl.controls[v];   // FormGroup
  }, control);
}

// merge a relative path with an absolute path
export function mergePath(currentPath: Front.Path, relativePath: string) {
  return splitPath(relativePath).reduce(
    (acc, v, idx) => v == '..' ? acc.slice(0,-1) : acc.concat(v)
  , currentPath);
}

// navigate to a control relative from the current one
export function relativeControl(control: AbstractControl, currentPath: Front.Path, relativePath: string) {
  let mergedPath = mergePath(currentPath, relativePath);
  return findControl(control, mergedPath);
}
