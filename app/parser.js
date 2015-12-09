var jsonPath = require('JSONPath');

Array.prototype.last = function() {
  return this[this.length-1];
}
Array.prototype.clean = function() {
  return this.filter((el, idx, arr) => el);
}
//let truthy = (el, idx, arr) => el;
Array.prototype.flatten = function() {
  return this.reduce((a, b) => a.concat(b), []);
}
// ^ recursion: http://stackoverflow.com/questions/27266550/how-to-flatten-nested-array-in-javascript
// create an element from an HTML string (with a single root element)
let elFromHtml = (html) => {
  let div = document.createElement('div');
  div.innerHTML = html;
  return div.firstChild;  //multiple: .childNodes
}
// immutable `appendChild`
Element.prototype.add = function(el) {
  let tmp = this.cloneNode(true);
  tmp.appendChild(el);
  return tmp;
}
//let nuller = () => null;
let nuller = (a, b, c, d, e) => {
  console.log("ERROR: no handler found", a, b, c, d, e);
  return null;
};
//let cloneOf = o => JSON.parse(JSON.stringify(o));

function parseVal(path, obj, req = true) {
  let type_map = {
    //array of multiple,
    "array": parseArray,  //uniqueItems: true -> Set
    "object": parseObject,
    "boolean": parseScalar,
    "integer": parseScalar,
    "number": parseScalar,
    "string": parseScalar,  //for input consider pattern (regex), format: uri, email, regex
    "null": nuller
  };
  let fn = type_map[obj.type] || nuller;  // not actually nothing! just means I don't have sufficient info to infer the type...
  //return fn(path, obj, req, k, id, if_part);
  return makeTemplate(fn, path, obj, req);
  //enum: white-listed values (esp. for string) -- in this case make scalars like radioboxes/drop-downs for input, or checkboxes for enum'd string[].
}

function parseArray(path, arr, req) {
  //type:array, uniqueItems, minItems, maxItems, default, items/anyOf/allOf/oneOf, additionalItems
  let type_map = {
    //no array of multiple, this'd be listed as anyOf/allOf, both currently unimplemented,
    "array": parseNested,
    "object": parseCollection,
    "boolean": parseList,
    "integer": parseList,
    "number": parseList,  //multipleOf, maximum, exclusiveMaximum, minimum, exclusiveMinimum
    "string": parseList,  //maxLength, minLength, format
    "null": nuller
  };
  let fn = type_map[arr.items.type] || nuller;
  //return fn(path.concat("[]"), arr, req);
  //path.concat("[]")
  return makeTemplate(fn, path, arr, req);
}

function parseObject(path, obj, req) {
  //not
  let properties = parseObjProps(path, obj.properties || {}, obj.required || []);
  let patternProperties = parsePattProps(path, obj.patternProperties || {}, false);
  let additionalProperties = obj.additionalProperties ? parseAddProps(path, obj, false) : "";
  return [properties, patternProperties, additionalProperties].clean().join("")
}

function parseObjProps(path, props, req) {
  return Object.keys(props)
  .map((k) => parseVal(path.concat(k), props[k], req.indexOf(k) >= 0))
  //.filter(truthy).join("")
  .clean().join("")
}

// additional properties... require knowledge from the api specification to know.
function parseAddProps(path, obj, req) {
  console.log("additional properties unimplemented", path.join("."), obj, req);
}

// pattern properties... require knowledge from the api specification to know.
function parsePattProps(path, patts, req) {
  console.log("pattern properties unimplemented", path.join("."), patts, req);
  // return Object.keys(patts)
  // .map((k) => parseVal(path.concat(k), patts[k], false))
  // // ^ specific path key still unknown... but for now pass along the pattern just in case?
  // .clean().join("")
}

function makeTemplate(fn, path, v, req) {
  let k = path.last();
  let id = path.join("-");
  let model = path.join("?.");  //elvis operator to prevent crashing if some element is missing
  req = false; //override for output purposes in case of imperfect API specs...
  let if_part = req ? '' : ` *ng-if="${model}"`;
  return fn(path, v, req, k, id, if_part, model);
}

let tooltip = o => o.description ? ` class="tooltipped" data-position="bottom" data-delay="50" data-tooltip="${o.description}"` : '';

function parseList(path, v, req, k, id, if_part, model) {
  return `<div${if_part}><p${tooltip(v)}>${k}:</p><table id="${id}"><li *ng-for="#item of ${model}">{{item}}</li></ul>\r\n`;
}

function parseCollection(path, v, req, k, id, if_part, model) {
  // not gonna work until I derive that .cols Set...
  let props = v.items.properties || {};
  let fixed = Object.keys(props);
  let fixed_ths = fixed.map(k => `<th>${k}</th>`).join("");
  let fixed_tds = fixed.map(k => `<td>{{item?.${k}}}</td>`).join(""); //[${k}]
  // async?
  let add_ths = v.items.additionalProperties ? `<th *ng-for="#col of ${model}">{{col}}</th>` : "";
  let add_tds = v.items.additionalProperties ? `<td *ng-for="#col of ${model}">{{item[col]}}</td>` : "";
  // `required`? additionalProperties?
  return `<div${if_part}><p${tooltip(v)}>${k}:</p><table id="${id}"><thead>${fixed_ths}${add_ths}</thead><tbody><tr *ng-for="#item of ${model}">${fixed_tds}${add_tds}</tr></tbody></table>\r\n`;
}

function parseNested(path, v, req, k, id, if_part, model) {
  console.log("nested arrays unimplemented", path.join("."), v, req, k, id, if_part, model);
}

function parseScalar(path, v, req, k, id, if_part, model) {
  //let inner = (k == "description") ? `<span bind-inner-html="${model} | marked"></span>` : `<span>{{${model}}}</span>`;
  let inner = `<span>{{${model}}}</span>`;
  if (v.format == "uri") inner = `<span><a href="{{${model}}}">{{${model}}}</a></span>`;
  if (v.format == "email") inner = `<span><a href="mailto:{{${model}}}">{{${model}}}</a></span>`;
  if (k == "description") inner = `<span bind-inner-html="${model} | marked"></span>`;
  return `<p id="${id}"${if_part}${tooltip(v)}>${k}: ${inner}</p>\r\n`;
}

// ng1 material components: https://github.com/Textalk/angular-schema-form-material/tree/develop/src
// accompanying logic + type mapping: https://github.com/Textalk/angular-schema-form/blob/development/src/services/schema-form.js#L233
// swagger editor ng1 html: https://github.com/swagger-api/swagger-editor/blob/master/app/templates/operation.html
// json editor: functional [elements](https://github.com/flibbertigibbet/json-editor/blob/develop/src/theme.js), [overrides](https://github.com/flibbertigibbet/json-editor/blob/develop/src/themes/bootstrap3.js)

export { parseVal };
