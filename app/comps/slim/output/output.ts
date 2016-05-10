// let jsonPath = require('JSONPath');
let _ = require('lodash/fp');
let marked = require('marked');
let validUrl = require('valid-url');
import { validate } from '../input/validators';

// infer the type for a value lacking a spec
export let infer_type = (v: any) => Array.isArray(v) ? 'array' : _.isObject(v) ? 'object' : 'scalar';

// for a spec using `*Of` try its different options to see if any one is valid for the given data
// (which seems fair for `oneOf` but blatantly disregards `allOf` and to lesser extent `anyOf`)
export let try_schema = (val: any, spec: Front.Spec) => {
  let options = _.get(['oneOf'], spec) || _.get(['anyOf'], spec) || _.get(['allOf'], spec) || [];
  let tp = _.find((schema, idx, arr) => validate(val, schema), options);
  return _.has(['type'], tp) ? tp :
    _.some(x => _.get([x], tp), ['oneOf','anyOf','allOf']) ?
    try_schema(val, tp) : null; //infer_type(val)
}

// meant to use without makeTemplate
export function parseScalar(path: Front.Path, api_spec: {}, schema: Front.Spec): string {
  let val = `${api_spec}`;
  // if(Array_last(path) == "description") {
  let last = path[path.length-1];   // [] breaks .path...
  if(last == "description") {
    // val = `<span class="markdown">${marked(val)}</span>`  // openapi MD descs, wrapped to ensure 1 node
    let tmp = marked(val);
    val = `<span class="markdown">${tmp}</span>`;  // openapi MD descs, wrapped to ensure 1 node
  } else if (validUrl.isUri(val)) {
    const IMG_EXTS = ['jpg','jpeg','bmp','png','gif','tiff','svg','bpg','heif','hdr','webp','ppm','pgm','pbm','pnm'].map(ext => '\\.' + ext);
    if (_.some(reg => new RegExp(reg, 'i').test(val))(IMG_EXTS)) {
      val = `<img src="${val}">`;
    } else {
      val = `<a href="${val}">${val}</a>`;
    }
  }
  switch (_.get(['format'], schema)) {
    // case "uri": return `<a href="${val}">${val}</a>`; //break;
    // case "email": return `<a href="mailto:${val}">${val}</a>`; //break;
    case "uri": let str1 = `<a href="${val}">${val}</a>`; return str1; //break;
    case "email": let str2 = `<a href="mailto:${val}">${val}</a>`; return str2; //break;
    default: return val;
  }
}
