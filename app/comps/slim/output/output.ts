// let jsonPath = require('JSONPath');
let _ = require('lodash/fp');
let marked = require('marked');
import { validate, validateFormat } from '../input/validators';

// infer the type for a value lacking a schema
export let inferType = (v: any) => Array.isArray(v) ? 'array' : _.isObject(v) ? 'object' : 'scalar';

// for a schema using `*Of` try its different options to see if any one is valid for the given data
// (which seems fair for `oneOf` but blatantly disregards `allOf` and to lesser extent `anyOf`)
export let trySchema = (val: any, schema: Front.Schema) => {
  let options = _.get(['oneOf'], schema) || _.get(['anyOf'], schema) || _.get(['allOf'], schema) || [];
  let tp = _.find((schema, idx, arr) => validate(val, schema), options);
  return _.has(['type'], tp) ? tp :
    _.some(x => _.get([x], tp), ['oneOf','anyOf','allOf']) ?
    trySchema(val, tp) : null; //inferType(val)
}

// html-wrap a uri
function wrapUri(s: string): string {
  return `<a href="${s}">${s}</a>`;
}

// html-wrap an email
function wrapEmail(s: string): string {
  return `<a href="mailto:${s}">${s}</a>`;
}

// meant to use without makeTemplate
export function parseScalar(val: any, schema: Front.Schema): string {
  let displayVal = _.get(['x-display-as', val])(schema);
  if(displayVal) return displayVal;
  let s = val.toString();
  if (validateFormat(s, 'uri')) {
    const IMG_EXTS = ['jpg','jpeg','bmp','png','gif','tiff','svg','bpg','heif','hdr','webp','ppm','pgm','pbm','pnm'].map(ext => '\\.' + ext);
    if (_.some(reg => new RegExp(reg, 'i').test(s))(IMG_EXTS)) {
      s = `<img src="${s}">`;
    } else {
      s = wrapUri(s);
    }
  // } else if (validateFormat(s, 'email')) {
  //   s = wrapEmail(s);
  }
  switch (_.get(['format'], schema)) {
    case "uri": return wrapUri(s);
    case "email": return wrapEmail(s);
    default: return s;
  }
}
