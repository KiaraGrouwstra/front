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
let key_spec = (
  k,
  swagger,
  fixed,
  patts = get_patts(swagger)
) => {
  let swag = _.get(['additionalProperties'], swagger);
  if(fixed.includes(k)) {
    swag = swagger.properties[k]
  } else {
    patts.forEach(p => {
      if(new RegExp(p).test(k)) {
        swag = swagger.patternProperties[p]
        // v.patt = p
      }
    })
  }
  return swag;
}

let get_fixed = (swag, api) => {
  let keys = Object.keys(api);
  return Object.keys(_.get(['properties'], swag) || {}).filter(k => keys.includes(k));
}

let get_patts = (swag) => Object.keys(_.get(['patternProperties'], swag) || {})

// meant to use without makeTemplate
function parseScalar(path, api_spec, swagger) {
  let val = `${api_spec}`
  // if(Array_last(path) == "description") {
  let last = path[path.length-1];   // [] breaks .path...
  if(last == "description") {
    val = `<span class="markdown">${marked(val)}</span>`  // swagger MD descs, wrapped to ensure 1 node
  }
  switch (_.get(['format'], swagger)) {
    case "uri": val = `<a href="${val}">${val}</a>`; break;
    case "email": val = `<a href="mailto:${val}">${val}</a>`; break;
    // default:
  }
  return val;
}

export { parseScalar, key_spec, get_fixed, get_patts, try_schema, infer_type };
