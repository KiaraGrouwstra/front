// let jsonPath = require('JSONPath');
let _ = require('lodash/fp');
let tv4 = require('tv4');
let marked = require('marked');

let infer_type = (v) => Array.isArray(v) ? "array" : _.isObject(v) ? "object" : "scalar"

let try_schema = (val, swag) => {
  let options = _.get(['oneOf'], swag) || _.get(['anyOf'], swag) || _.get(['allOf'], swag) || []
  let tp = _.find((schema, idx, arr) => tv4.validate(val, schema, false, false, false), options)
  return _.get(['type'], tp) ? tp :
    _.some(x => _.get([x], tp), ['oneOf','anyOf','allOf']) ?
    try_schema(val, tp) : null //infer_type(val)
}

// for a given object key get the appropriate swagger spec
let key_spec = (k, swagger) => {
  return _.get(['properties', k], swagger)
  || _.get(['patternProperties', _.find(p => new RegExp(p).test(k)(
    Object.keys(_.get(['patternProperties'], swagger) || {})
  ))], swagger)
  || _.get(['additionalProperties'], swagger);
}

// meant to use without makeTemplate
function parseScalar(path, api_spec, swagger) {
  let val = `${api_spec}`
  // if(Array_last(path) == "description") {
  let last = path[path.length-1];   // [] breaks .path...
  if(last == "description") {
    // val = `<span class="markdown">${marked(val)}</span>`  // swagger MD descs, wrapped to ensure 1 node
    let tmp = marked(val);
    val = `<span class="markdown">${tmp}</span>`  // swagger MD descs, wrapped to ensure 1 node
  }
  switch (_.get(['format'], swagger)) {
    // case "uri": return `<a href="${val}">${val}</a>`; //break;
    // case "email": return `<a href="mailto:${val}">${val}</a>`; //break;
    case "uri": let str1 = `<a href="${val}">${val}</a>`; return str1; //break;
    case "email": let str2 = `<a href="mailto:${val}">${val}</a>`; return str2; //break;
    default: return val;
  }
}

export { parseScalar, key_spec, try_schema, infer_type };
