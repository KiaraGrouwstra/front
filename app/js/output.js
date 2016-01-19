// let jsonPath = require('JSONPath');
let _ = require('lodash');
// let probe = require('titon-probe')
// let _ = probe._
// let _s = probe._s
let tv4 = require('tv4');
let jQuery = require('jquery'); //$ =
let marked = require('marked');
import { arrToSet } from './rx_helpers';  //, elemToArr, arrToArr, elemToSet, setToSet, loggers, notify
// require('rxjs/Observable');
import {Observable} from 'rxjs/Observable';
import { Array_last, Array_has, Array_clean, Array_flatten, Object_filter, RegExp_escape, arr2obj, toast, mapBoth, String_stripOuter, getPaths, id_cleanse } from './js.js'; //, Obs_do, Obs_then
// Observable.prototype.do = Obs_do;
// Observable.prototype.then = Obs_then;
Array.prototype.last = Array_last;
Array.prototype.has = Array_has;
Array.prototype.clean = Array_clean;
Array.prototype.flatten = Array_flatten;
String.prototype.stripOuter = String_stripOuter;
import { Templates } from './jade';

//let nuller = () => null;
let nuller = (a, b, c, d, e) => {
  console.log("ERROR: no handler found", a, b, c, d, e);
  return null;
};

// let Kinds = { FIXED: 1, PATTERN: 2, ADDITIONAL: 3 }
// var SymbolEnum = require('symbol-enum')
// var Kinds = new SymbolEnum('FIXED', 'PATTERN', 'ADDITIONAL')  //Kinds.FIXED
let SCALARS = ["boolean", "integer", "number", "string", "null", "scalar"];

let infer_type = (v) => Array.isArray(v) ? "array" : _.isObject(v) ? "object" : "scalar"

let try_schema = (val, swag) => {
  let options = _.get(swag, ['oneOf']) || _.get(swag, ['anyOf']) || _.get(swag, ['allOf']) || []
  let tp = _.find(options, (schema, idx, arr) => tv4.validate(val, schema, false, false, false))
  return _.get(tp,['type']) ? tp :
    _.any(['oneOf','anyOf','allOf'], x => _.get(tp,[x])) ?
    try_schema(val, tp) : null //infer_type(val)
}

function getHandler(type, map) {
  let key = (SCALARS.has(type)) ? "scalar" : type;
  return map[key] || nuller;  // not actually nothing! just means I don't have sufficient info to infer the type...
}

// turns JSON plus its spec into html
function parseVal(path, api_spec, swagger) {
  let type_map = {
    //array of multiple,
    "array": parseArray,  //uniqueItems: true -> Set
    "object": parseObject,
    "scalar": parseScalar, //for string input consider pattern (regex), format: uri, email, regex
  };
  swagger = _.get(swagger,['type']) ? swagger : try_schema(api_spec, swagger)
  let tp = _.get(swagger, ['type']) || infer_type(api_spec)
  let fn = getHandler(tp, type_map);
  return fn(path, api_spec, swagger, false);
}

function parseArray(path, api_spec, swagger, named) {
  //items/anyOf/allOf/oneOf, additionalItems
  //no array of multiple, this'd be listed as anyOf/allOf or additionalItems, both currently unimplemented,
  let type_map = {
    "array": makeUL, //parseNested,
    "object": makeTable,
    "scalar": makeUL, //parseList,
  };
  let first = _.get(api_spec, [0])
  swagger = _.get(swagger, ['items', 'type']) ? swagger.items : try_schema(first, _.get(swagger, ['items']))
  let tp = _.get(swagger, ['type']) || infer_type(first)
  let fn = getHandler(tp, type_map);
  return makeTemplate(fn, path, api_spec, swagger, named);
}

// for a given object key get the appropriate swagger spec
let key_spec = (
  k,
  swagger,
  fixed,  // = get_fixed(swagger, api_spec)
  patts = get_patts(swagger)
) => {
  // let kind = Kinds.ADDITIONAL
  let swag = _.get(swagger, ['additionalProperties'])
  if(fixed.has(k)) {
    // kind = Kinds.FIXED
    swag = swagger.properties[k]
  } else {
    patts.forEach(p => {
      if(new RegExp(p).test(k)) {
        // kind = Kinds.PATTERN
        swag = swagger.patternProperties[p]
        // v.patt = p
      }
    })
  }
  return swag;
  // return {kind: kind, swag: swag};
}

let get_fixed = (swag, api) => {
  let keys = Object.keys(api);
  return Object.keys(_.get(swag, ['properties']) || {}).filter(k => keys.has(k));
}

let get_patts = (swag) => Object.keys(_.get(swag, ['patternProperties']) || {})

function parseObject(path, api_spec, swagger, named, template = Templates.card_object) {
  //not
  let {id: id, k: k} = getPaths(path)
  // let Types = { ANY: 0, SCALAR: 1, ARRAY: 2, OBJECT: 3 }
  let keys = Object.keys(api_spec);
  let fixed = get_fixed(swagger, api_spec)
  let patts = get_patts(swagger)
  let coll = _.object(keys, keys.map(k => {
    // let v = {swag: swagger.additionalProperties, pars: null} //Types.ANY, type: "any", kind: Kinds.ADDITIONAL, patt: null
    let swag = key_spec(k, swagger, fixed, patts)
    // let {kind: kind, swag: swag} = key_spec(k, swagger, fixed, patts)
    let path_k = path.concat(id_cleanse(k));
    let pars = [path_k, api_spec[k], swag] //v.
    let tp = _.get(swag, ['type']) || infer_type(api_spec[k])
    if(SCALARS.has(tp)) tp = "scalar"
    return {pars: pars, type: tp}  //swag: swag, kind: kind,
  }).clean()) //switch to _.compact()? also, if I filter the v array, how will they match up with the keys??

  let [scalars, arrays, objects] = ['scalar','array','object'].map(x => Object_filter(coll, v => v.type == x))
  let scal = makeDL(path, api_spec, swagger, scalars)
  // ES7 Object.values...
  let obj = Object.keys(objects).map(k => parseObject(...objects[k].pars, true))
  let arr = Object.keys(arrays).map(k => parseArray(...arrays[k].pars, true))
  return template({k: k, id: id, scal: scal, obj: obj, arr: arr, named: named })
}


function makeTemplate(fn, path, api_spec, swagger, named) {
  let {k: k, id: id, model: model} = getPaths(path)
  return fn(path, api_spec, swagger, k, id, model, named);
}

// let tooltip = o => o.description ? ` class="tooltipped" data-position="bottom" data-delay="50" data-tooltip="${o.description}"` : '';

function makeUL(path, api_spec, swagger, k, id, model, named, template = Templates.ul_table) {
  let rows = (api_spec || []).map((v, idx) => {
    let path_k = path.concat(idx)
    let val = parseVal(path_k, v, _.get(swagger, ['items']))
    return Object.assign(getPaths(path_k), {val: val})
  });
  return template({k: k, id: id, rows: rows, named: named})
}

function makeDL(path, api_spec, swagger, scalar_coll, template = Templates.dl_table) {
  // return `<dl id="${id}"><div *ng-for="#item of ${model}"><dt>{{item}}</dt><dd>{{item}}</dd></div></dl>\r\n`;
  let rows = Object.keys(scalar_coll).map(k => {
    let val = parseVal(...scalar_coll[k].pars)
    return Object.assign(getPaths(path.concat(k)), {val: val})
  });
  return template({rows: rows})
}

function makeTable(path, api_spec, swagger, k, id, model, named, template = Templates.card_table) {
  let fixed = get_fixed(swagger, api_spec)
  let patts = get_patts(swagger)
  let col_keys = Array.from(api_spec
    .map(x => Object.keys(x))
    .reduce(arrToSet, new Set)
  )
  let cols = col_keys.map(k => getPaths(path.concat(k)))
  let rows = api_spec.map((rw, idx) => {
    let {k: k, id: id, model: model} = getPaths(path.concat(idx))
    let cells = col_keys.map(col => {
      let k_path = path.concat([idx, col])
      let val = parseVal(k_path, rw[col], key_spec(col, swagger, fixed, patts))
      return Object.assign(getPaths(k_path), {val: val})
    })
    return {id: id, cells: cells}
  });
  return template({k: k, id: id, cols: cols, rows: rows, named: named})
}

// meant to use without makeTemplate
function parseScalar(path, api_spec, swagger) {
  console.log('parseScalar', path, api_spec, swagger);
  let val = `${api_spec}`
  console.log('val', val);
  // if(Array_last(path) == "description") {
  let last = path[path.length-1];   // [] breaks .path...
  if(last == "description") {
    val = `<span class="markdown">${marked(val)}</span>`  // swagger MD descs, wrapped to ensure 1 node
  }
  switch (_.get(swagger, ['format'])) {
    case "uri": val = `<a href="${val}">${val}</a>`; break;
    case "email": val = `<a href="mailto:${val}">${val}</a>`; break;
    // default:
  }
  // console.log('final val', val);
  return val;
}

// ng1 material components: https://github.com/Textalk/angular-schema-form-material/tree/develop/src
// accompanying logic + type mapping: https://github.com/Textalk/angular-schema-form/blob/development/src/services/schema-form.js#L233
// swagger editor ng1 html: https://github.com/swagger-api/swagger-editor/blob/master/app/templates/operation.html
// json editor: functional [elements](https://github.com/flibbertigibbet/json-editor/blob/develop/src/theme.js), [overrides](https://github.com/flibbertigibbet/json-editor/blob/develop/src/themes/bootstrap3.js)

export { parseVal, parseScalar, parseArray, parseObject, makeUL, makeDL, makeTable };
