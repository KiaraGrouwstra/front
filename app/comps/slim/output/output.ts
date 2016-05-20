// let jsonPath = require('JSONPath');
let _ = require('lodash/fp');
let marked = require('marked');
import { validate, validateFormat } from '../input/validators';

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

// html-wrap a uri
function wrapUri(s: string): string {
  return `<a href="${s}">${s}</a>`;
}

// html-wrap an email
function wrapEmail(s: string): string {
  return `<a href="mailto:${s}">${s}</a>`;
}

// meant to use without makeTemplate
export function parseScalar(val: any, spec: Front.Spec): string {
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
  switch (_.get(['format'], spec)) {
    case "uri": return wrapUri(s);
    case "email": return wrapEmail(s);
    default: return s;
  }
}
